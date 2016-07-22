#!/usr/bin/env node

'use strict'

// Core
const path = require('path')

// Vendor
const program = require('commander'),
	Promise = require('bluebird')

// Local
const putil = require('./modules/putil'),
	ModuleId = require('./modules/ModuleId')

const BootService = require('../services/BootService'),
	WorkerService = require('../services/WorkerService'),
	InterruptError = require('./lib/errors/InterruptError'),
	ModuleDepNode = require('./modules/ModuleDepNode'),
	ModuleDepGraph = require('./modules/ModuleDepGraph')

// Constants
const k1KB = 1024,
	kModulesOncePath = path.resolve(__dirname, 'modules', 'once'),
	kModulesPerGenomePath = path.resolve(__dirname, 'modules', 'per-genome'),
	kShutdownGracePeriodMs = 30000,
	kIsolationLevels = BootService.Sequelize.Transaction.ISOLATION_LEVELS

// Leverage bluebird globally for all Promises
global.Promise = Promise

let availableModules = putil.enumerateModules(kModulesOncePath, kModulesPerGenomePath)
putil.addDefaultStaticMethods(availableModules.all)

program
.description(`Executes a pipeline of one or more MiST modules. There are two main
  types of modules:

  1. "once" modules run once per pipeline invocation. They are always executed
     prior to any "per-genome" modules. All such modules must be located
     beneath the modules/once folder. Available "once" modules include:

${putil.modulesHelp(availableModules.once)}

  2. "per-genome" modules are serially invoked for one genome at a time before
     processing the next genome. Available "per-genome" modules include:

${putil.modulesHelp(availableModules.perGenome)}

  If no genome-ids are specified via the options, this script will iterate the
  module pipeline for all genomes in the database that have not yet been
  analyzed with at least one of the requested modules. Otherwise, it is only
  applied to the specified genomes with genome-ids.
`)
.usage('[options] <module ...>')
.option('-o, --run-once <module,...>', 'CSV list of module names', (value) => value.split(','))
.option('-g, --genome-ids <genome id,...>', 'CSV list of genome ids', parseGenomeIds)
.parse(process.argv)

let onceModuleIdStrings = program.runOnce || [],
	perGenomeModuleIdStrings = program.args

if (!onceModuleIdStrings.length && !perGenomeModuleIdStrings.length) {
	program.outputHelp()
	process.exit(1)
}

let requestedOnceModuleIds = ModuleId.fromStrings(onceModuleIdStrings),
	requestedPerGenomeModuleIds = ModuleId.fromStrings(perGenomeModuleIdStrings)

dieIfRequestedInvalidModules()

let bootService = new BootService({
		logger: {
			name: 'pipeline',
			streams: [
				{
					level: 'info',
					stream: process.stdout
				}
			]
		}
	}),
	logger = bootService.logger(),
	worker = null,
	shuttingDown = false,
	numShutdownRequests = 0

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Resolve all non-promise return values to promises
Promise.coroutine.addYieldHandler((value) => Promise.resolve(value))

// --------------------------------------------------------
// --------------------------------------------------------
// Main program startup
bootService.setup()
.then(() => bootService.publicIP())
.then((publicIP) => {
	let workerService = new WorkerService(bootService.models(), publicIP)
	worker = workerService.buildWorker()
	worker.job = {
		genomeIds: program.genomeIds,
		modules: {
			once: onceModuleIdStrings,
			perGenome: perGenomeModuleIdStrings
		}
	}
	return worker.save()
})
.then(() => {
	logger = logger.child({
		workerId: worker.id,
		ip: worker.public_ip
	})
	logger.info('Registered new worker')
})
.then(() => {
	let app = {
		worker,
		config: BootService.config,
		logger: null,
		shutdownCheck,
		models: bootService.models(),
		sequelize: bootService.sequelize()
	}

	return runOnceModules(app, requestedOnceModuleIds)
	.then(() => runPerGenomeModules(app, requestedPerGenomeModuleIds))
})
.then(() => {
	// Worker cleanup
	logger.info('Pipeline module(s) completed successfully.')
	return unregisterWorker()
})
.then(() => {
	logger.info('Good bye!')
})
.catch((error) => {
	logError(error)
	return saveWorkerError(error)
})
.catch(logError)

// --------------------------------------------------------
// --------------------------------------------------------
function dieIfRequestedInvalidModules() {
	let invalidOnces = putil.findInvalidModuleIds(requestedOnceModuleIds, availableModules.once)
	if (invalidOnces.length) {
		die('the following "once" modules (or submodules) are invalid\n\n' +
			`  ${invalidOnces.join('\n  ')}\n`)
	}

	let invalidPerGenomes = putil.findInvalidModuleIds(requestedPerGenomeModuleIds, availableModules.perGenome)
	if (invalidPerGenomes.length) {
		die('the following "per-genome" modules (or submodules) are invalid\n\n' +
			`  ${invalidPerGenomes.join('\n  ')}\n`)
	}
}

function die(message, optError) {
	// eslint-disable-next-line no-console
	console.error(`FATAL: ${message}`)
	if (optError) {
		// eslint-disable-next-line no-console
		console.error('\n', optError)
	}
	else {
		console.error('-'.repeat(60)) // eslint-disable-line
		program.outputHelp()
	}
	process.exit(1)
}

function parseGenomeIds(csvGenomeIds) {
	if (!csvGenomeIds)
		return null

	let ids = new Set(csvGenomeIds.split(',').map((genomeId) => Number(genomeId)))
	for (let genomeId of ids) {
		if (!/^[1-9]\d*$/.test(genomeId))
			throw new Error('Each genome id must be a positive integer')
	}

	return Array.from(ids)
}

function unregisterWorker() {
	if (!worker)
		return Promise.resolve()

	logger.info('Updating worker database active status to false')
	worker.active = false
	worker.normal_exit = true

	return worker.save({fields: ['active', 'normal_exit']})
	.then(() => {
		worker = null
	})
}

function logError(error) {
	let shortMessage = error.message ? error.message.substr(0, k1KB) : null

	switch (error.constructor) {
		case BootService.Sequelize.DatabaseError:
			logger.error({name: error.name, sql: error.sql.substr(0, k1KB)}, shortMessage)
			return
		case BootService.Sequelize.ValidationError:
			logger.error({errors: error.errors, record: error.record}, shortMessage)
			return
		case InterruptError:
			logger.error(shortMessage)
			return

		default:
			logger.error({error, stack: error.stack}, `Unhandled error: ${shortMessage}`)
			return
	}
}

function saveWorkerError(error) {
	if (!worker)
		return Promise.resolve()

	logger.info('Updating worker status')
	worker.active = false
	worker.normal_exit = false
	worker.error_message = error.message ? error.message.substr(0, k1KB) : null
	if (error.constructor !== InterruptError)
		worker.error_message += '\n\n' + error.stack
	return worker.save({fields: ['active', 'normal_exit', 'error_message', 'job']})
	.catch(BootService.Sequelize.DatabaseError, () => {
		// When would this ever happen? One example is the genbankReaderStream reading in compressed
		// gzip data (vs the uncompressed raw text) and including in the error message the binary
		// data line.
		worker.error_message = 'Error message could not be saved to the database. ' +
			'Please check the logs for contextual details.'
		return worker.save({fields: ['active', 'normal_exit', 'error_message', 'job']})
	})
}

function shutdown() {
	logger.info('Shutdown request received')
	shuttingDown = true
	numShutdownRequests++
	if (numShutdownRequests > 1) {
		logger.fatal('Multiple shutdown requests received. Forcefully shutting down')
		process.exit(1)
	}

	let failSafeTimer = setTimeout(() => {
		logger.fatal('Process did not exit within the grace period. Forcefully exiting.')
		process.exit(1)
	}, kShutdownGracePeriodMs)

	failSafeTimer.unref()
}

function shutdownCheck() {
	if (shuttingDown)
		throw new InterruptError()
}

function runOnceModules(app, moduleIds) {
	let moduleClassMap = putil.mapModuleClassesByName(availableModules.once)

	return Promise.each(moduleIds, (moduleId) => {
		shutdownCheck()
		logger.info(`Starting "once" module: ${moduleId}`)
		app.logger = logger.child({moduleId})
		let ModuleClass = moduleClassMap.get(moduleId.name()),
			moduleInstance = new ModuleClass(app, moduleId.subNames())
		return moduleInstance.main()
		.then(() => {
			logger.info(`Module finished normally: ${module.name}`)
		})
	})
}

function runPerGenomeModules(app, moduleIds) {
	if (!moduleIds.length)
		return null

	let moduleClassMap = putil.mapModuleClassesByName(availableModules.perGenome),
		unnestedDeps = putil.unnestedDependencyArray(availableModules.perGenome),
		rootDepNode = ModuleDepNode.createFromDepList(unnestedDeps),
		depGraph = new ModuleDepGraph(rootDepNode, logger),
		unnestedModuleIds = ModuleId.unnest(moduleIds),
		lastGenomeId = null

	return Promise.coroutine(function *() {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			shutdownCheck()
			let genome = yield lockNextAvailableGenome(app, unnestedModuleIds, lastGenomeId)
			if (!genome)
				break

			logger.info({genomeId: genome.id, name: genome.name}, `Locked genome: ${genome.name}`)

			let genomeState = yield app.models.WorkerModule.findAll({
				where: {
					genome_id: genome.id
				}
			})
			depGraph.loadState(genomeState)
			let incompleteModuleIds = depGraph.incompleteModuleIds(unnestedModuleIds)
			incompleteModuleIds = depGraph.orderByDepth(incompleteModuleIds)
			incompleteModuleIds = ModuleId.nest(incompleteModuleIds)

			for (let moduleId of incompleteModuleIds) {
				shutdownCheck()

				// Dependency check. The Dep graph uses flat single subname
				let repModuleId = moduleId.unnest()[0]
				let missingDependencies = depGraph.missingDependencies(repModuleId)
				if (missingDependencies.length) {
					logger.info({missingDependencies}, `Unable to run: ${moduleId}. The following dependencies are not satisfied: ${missingDependencies.join(', ')}`)
					continue
				}

				let ModuleClass = moduleClassMap.get(moduleId.name())
				app.logger = logger.child({
					moduleId: moduleId.toString(),
					genome: {
						id: genome.id,
						name: genome.name
					}
				})
				logger.info(`Starting module: ${moduleId}`)
				let moduleInstance = new ModuleClass(app, genome, moduleId.subNames()),
					workerModules = yield moduleInstance.main()
				depGraph.updateState(workerModules)
				logger.info(`Module finished normally: ${moduleId}`)
			}

			yield unlockGenome(genome)
			logger.info({genome: {id: genome.id, name: genome.name}}, `Unlocked genome: ${genome.name}`)

			lastGenomeId = genome.id
		}
	})()
}

/**
 * Locks the next available (is not associated with another worker - dead or alive) genome that has
 * at least one of ${modules} incomplete (never started or in the error state).
 *
 * @param {Object} app
 * @param {Array.<ModuleId>} moduleIds
 * @param {Number} [lastGenomeId=null]
 * @returns {Promise.<Genome>}
 */
function lockNextAvailableGenome(app, moduleIds, lastGenomeId = null) {
	let genomesTable = app.models.Genome.tableName,
		workerModulesTable = app.models.WorkerModule.tableName,
		minGenomeIdClause = lastGenomeId ? `AND a.id > ${lastGenomeId} ` : '',
		genomeIdClause = program.genomeIds ? `AND a.id IN (${program.genomeIds.join(',')}) ` : '',
		queryModuleArrayString = `ARRAY['${moduleIds.join("','")}']`,
		sql =
`WITH done_genomes_modules AS (
	SELECT b.genome_id, array_agg(module) as modules
	FROM ${genomesTable} a JOIN ${workerModulesTable} b ON (a.id = b.genome_id)
	WHERE a.worker_id is null AND (b.id is null OR b.redo is false) AND b.state = 'done'
	GROUP BY b.genome_id
)
SELECT a.*
FROM ${genomesTable} a LEFT OUTER JOIN done_genomes_modules b ON (a.id = b.genome_id)
WHERE a.worker_id is null ${minGenomeIdClause} ${genomeIdClause} AND (b.genome_id is null OR NOT b.modules @> ${queryModuleArrayString})
ORDER BY a.id
LIMIT 1
FOR UPDATE`

	return app.sequelize.transaction({isolationLevel: kIsolationLevels.READ_COMMITTED}, () => {
		return app.sequelize.query(sql, {
			model: app.models.Genome,
			type: app.sequelize.QueryTypes.SELECT
		})
		.then((genomes) => {
			if (!genomes.length)
				return null

			return genomes[0].update({
				worker_id: app.worker.id
			}, {fields: ['worker_id']})
		})
	})
}

function unlockGenome(genome) {
	return genome.update({
		worker_id: null
	}, {fields: ['worker_id']})
}
