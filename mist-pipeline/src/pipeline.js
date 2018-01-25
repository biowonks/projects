#!/usr/bin/env node

'use strict'

// Core
const assert = require('assert')
const path = require('path')

// Vendor
const program = require('commander')
const Promise = require('bluebird')

// Local
const config = require('../config')
const putil = require('lib/putil')
const ModuleId = require('lib/ModuleId')
const InterruptError = require('lib/InterruptError')
const ModuleDepNode = require('lib/ModuleDepNode')
const ModuleDepGraph = require('lib/ModuleDepGraph')
const MistBootService = require('mist-lib/services/MistBootService')
const WorkerService = require('mist-lib/services/WorkerService')

// Constants
const k1KB = 1024
const kModulesOncePath = path.resolve(__dirname, '..', 'src', 'modules', 'once')
const kModulesPerGenomePath = path.resolve(__dirname, '..', 'src', 'modules', 'per-genome')
const kShutdownGracePeriodMs = 30000
const kIsolationLevels = MistBootService.Sequelize.Transaction.ISOLATION_LEVELS

// Leverage bluebird globally for all Promises
global.Promise = Promise

const availableModules = putil.enumerateModules(kModulesOncePath, kModulesPerGenomePath)

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

  # Genome filtering
  If no genome-ids are specified via the options, this script will iterate the
  module pipeline for all genomes in the database that have not yet been
  analyzed with at least one of the requested modules. Otherwise, it is only
  applied to the specified genomes with genome-ids.

  # Redo'ing a module
  It may make sense to "redo" a module (e.g. changes to the processing logic
  such as how gene clusters are predicted). To leverage parallel pipeline
  workers and progressively compute this data, all modules to be redone are
  tagged in the database (redo = true). If redo'ing this module per genome
  does not break any dependencies, this worker script will begin redoing each
  of the specified modules. Since the redo flag is assigned to all matching
  module ids, it is possible for another worker script to also join forces
  with this script when redoing data. Moreover, if a script crashes, the redo
  state is still present in the database for future workers.

  # Undoing a module
  Currently, only per-genome modules may be undone and these are done
  in the reverse order as specified in the module dependency graph. Any
  modules to be undone will be undone prior to running any per-genome
  modules.
`)
.usage('[options] <module ...>')
.option('-g, --genome-ids <genome id,...>', 'CSV list of genome ids', parseGenomeIds)
.option('-q, --query <value>', 'arbitrary query data passed to each module')
.option('-r, --redo <module,...>', 'CSV list of module names', (value) => value.split(','))
.option('-u, --undo <module,...>', 'CSV list of module names', (value) => value.split(','))
.parse(process.argv)

const requestedModuleIds = ModuleId.nest(ModuleId.fromStrings([...(program.redo || []), ...program.args]))
const requestedRedoModuleIds = ModuleId.nest(ModuleId.fromStrings(program.redo || []))
const requestedUndoModuleIds = ModuleId.nest(ModuleId.fromStrings(program.undo || []))

if (!requestedUndoModuleIds.length && !requestedModuleIds.length) {
	program.outputHelp()
	process.exit(1)
}

dieIfRequestedInvalidModules()
dieIfRequestedToRedoOnceModule()
dieIfRequestedToUndoOnceModule()

const requestedOnceModuleIds = putil.matchingModuleIds(requestedModuleIds, availableModules.once)
const requestedPerGenomeModuleIds = putil.matchingModuleIds(requestedModuleIds, availableModules.perGenome)
const bootService = new MistBootService({
	logger: {
		name: 'pipeline',
		streams: [
			{
				level: 'info',
				stream: process.stdout
			}
		]
	}
})
let logger = bootService.logger()
let worker = null
let shuttingDown = false
let numShutdownRequests = 0

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
	const workerService = new WorkerService(bootService.models(), publicIP)
	worker = workerService.buildWorker()
	worker.job = {
		genomeIds: program.genomeIds,
		undo: requestedUndoModuleIds,
		modules: {
			once: requestedOnceModuleIds,
			perGenome: requestedPerGenomeModuleIds
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
	const app = {
		worker,
		config,
		logger: null,
		query: program.query,
		shutdownCheck,
		models: bootService.models(),
		sequelize: bootService.sequelize()
	}

	return runOnceModules(app, requestedOnceModuleIds)
	.then(() => tagModulesForRedo(app, requestedRedoModuleIds))
	.then(() => runPerGenomeModules(app, requestedUndoModuleIds, requestedPerGenomeModuleIds))
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
.finally(() => bootService.sequelize().close()) // faster shutdown

// --------------------------------------------------------
// --------------------------------------------------------
function dieIfRequestedInvalidModules() {
	const invalidUndoModuleIds = putil.findInvalidModuleIds(requestedUndoModuleIds, availableModules.all)
	if (invalidUndoModuleIds.length) {
		die('the following "undo" modules (or submodules) are invalid\n\n' +
			`  ${invalidUndoModuleIds.join('\n  ')}\n`)
	}

	const invalidModuleIds = putil.findInvalidModuleIds(requestedModuleIds, availableModules.all)
	if (invalidModuleIds.length) {
		die('the following modules (or submodules) are invalid\n\n' +
			`  ${invalidModuleIds.join('\n  ')}\n`)
	}
}

function dieIfRequestedToUndoOnceModule() {
	const onceModuleIds = putil.matchingModuleIds(requestedUndoModuleIds, availableModules.once)
	if (onceModuleIds.length) {
		die('Undo is only supported for per-genome modules, but the following once modules were ' +
			`specified for undo: ${onceModuleIds.join(', ')}`)
	}
}

function dieIfRequestedToRedoOnceModule() {
	const onceModuleIds = putil.matchingModuleIds(requestedRedoModuleIds, availableModules.once)
	if (onceModuleIds.length) {
		die('Redo is only supported for per-genome modules, but the following once modules were ' +
			`specified for redo: ${onceModuleIds.join(', ')}`)
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

	const ids = new Set(csvGenomeIds.split(',').map((genomeId) => Number(genomeId)))
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
	const shortMessage = error.message ? error.message.substr(0, k1KB) : null

	switch (error.constructor) {
		case MistBootService.Sequelize.DatabaseError:
			logger.error({name: error.name, sql: error.sql.substr(0, k1KB)}, shortMessage)
			return
		case MistBootService.Sequelize.ValidationError:
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
	.catch(MistBootService.Sequelize.DatabaseError, () => {
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

	const failSafeTimer = setTimeout(() => {
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
	const moduleClassMap = putil.mapModuleClassesByName(availableModules.once)

	return Promise.each(moduleIds, (moduleId) => {
		shutdownCheck()
		logger.info(`Starting "once" module: ${moduleId}`)
		app.logger = logger.child({moduleId})
		const ModuleClass = moduleClassMap.get(moduleId.name())
		const moduleInstance = new ModuleClass(app, moduleId.subNames())
		return moduleInstance.main()
		.then(() => {
			logger.info(`Module finished normally: ${moduleId}`)
		})
	})
}

function tagModulesForRedo(app, moduleIds) {
	const where = {
		redo: false,
		state: 'done',
		module: {
			$in: ModuleId.unnest(moduleIds).map((x) => x.toString())
		}
	}
	if (program.genomeIds) {
		where.genome_id = {
			$in: program.genomeIds
		}
	}

	return app.models.WorkerModule.update({
		redo: true
	}, {where})
	.then((result) => {
		const affectedCount = result[0]
		if (affectedCount)
			logger.info(`Marked ${affectedCount} worker modules for redo`)
	})
}

function runPerGenomeModules(app, undoModuleIds, moduleIds) {
	if (!undoModuleIds.length && !moduleIds.length)
		return null

	const moduleClassMap = putil.mapModuleClassesByName(availableModules.perGenome)
	const depGraph = createDepGraph(availableModules.perGenome)
	let unnestedUndoModuleIds = ModuleId.unnest(undoModuleIds)
	const unnestedModuleIds = ModuleId.unnest(moduleIds)
	let lastGenomeId = null

	return Promise.coroutine(function *() {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			shutdownCheck()
			const genome = yield lockNextAvailableGenome(app, unnestedUndoModuleIds, unnestedModuleIds, lastGenomeId)
			const nothingAvailableToDo = !genome
			if (nothingAvailableToDo)
				break

			try {
				yield loadGenomeState(app, genome, depGraph)
				const activeUndoModuleIds = depGraph.moduleIdsInStates('active', 'undo')
				if (activeUndoModuleIds.length) {
					logger.warn({
						genomeId: genome.id,
						name: genome.name,
						activeUndoModuleIds: activeUndoModuleIds.map((x) => x.toString())
					}, `Cannot process genome until the following 'active' / 'undo' modules are resolved: ${activeUndoModuleIds.join(', ')}`)
				}
				else {
					// Safe to assume that all worker modules are:
					// 1) done (redo = false)
					// 2) done (redo = true): only these require special processing. In particular,
					//    they need to be undone first. To capture this effect, we simply add these
					//    to the unnestedUndoModuleIds array :) By leveraging the existing undo
					//    logic, we reuse all the sanity checks and logic like ensuring that they
					//    are undone in the proper order.
					// 3) error

					// The following pushes redo modules onto the undo stack :) Note that
					// redoModuleIds are not necessarily the ones specified on the command line.
					// They are based on the dependency graph which is build from the database
					// state.
					const redoModuleIds = depGraph.matchingModuleIds(unnestedModuleIds, (node) => {
						const workerModule = node.workerModule()
						return workerModule &&
							workerModule.state === 'done' &&
							workerModule.redo === true
					})
					unnestedUndoModuleIds = [...unnestedUndoModuleIds, ...redoModuleIds]

					yield undoModules(app, genome, unnestedUndoModuleIds, depGraph, moduleClassMap)
					yield runModules(app, genome, unnestedModuleIds, depGraph, moduleClassMap)
				}
			}
			catch (error) {
				yield unlockGenome(genome)
				throw error
			}

			yield unlockGenome(genome)
			lastGenomeId = genome.id
		}
	})()
}

function createDepGraph(ModuleClasses) {
	const unnestedDeps = putil.unnestedDependencyArray(ModuleClasses)
	throwErrorIfInvalidDependency(unnestedDeps)
	const rootDepNode = ModuleDepNode.createFromDepList(unnestedDeps)
	return new ModuleDepGraph(rootDepNode, logger)
}

function throwErrorIfInvalidDependency(unnestedDeps) {
	const validModuleNames = new Set()
	unnestedDeps.forEach((dep) => validModuleNames.add(dep.name))
	unnestedDeps.forEach((dep) => {
		dep.dependencies.forEach((name) => {
			if (!validModuleNames.has(name))
				throw new Error(`Invalid dependency in ${dep.name}: ${name} is not a valid module`)
		})
	})
}

/**
 * Locks the next available (is not associated with another worker - dead or alive) genome that has
 * at least one of {$undoModuleIds} already completed or at least one of ${moduleIds} incomplete
 * (never started or in the error state) and a genome id greater than ${lastGenomeId}.
 *
 * When undo'ing a module, the redo value is of no relevance (undo will be done either way);
 * however, when assessing if a module needs to be run, the value of redo does matter. If redo is
 * false and state is 'done', then it is safe to assume that this module does not need re-run.
 * On the other hand, 'done' modules with a true redo value should not be considered as done when
 * evaluating if the genome has outstanding data to be processed. To simultaneously handle these
 * cases in one query, two array aggregates on the workers_modules table are performed. One for
 * undo_modules and one for modules to be executed. After locking a genome, the state is then
 * inspected application side to know which path to execute (see runPerGenomeModules)
 *
 * @param {Object} app
 * @param {Array.<ModuleId>} undoModuleIds
 * @param {Array.<ModuleId>} moduleIds
 * @param {Number} [lastGenomeId=null]
 * @returns {Promise.<Genome>}
 */
function lockNextAvailableGenome(app, undoModuleIds, moduleIds, lastGenomeId = null) {
	assert(undoModuleIds.length + moduleIds.length > 0)

	const genomesTable = app.models.Genome.getTableName()
	const workerModulesTable = app.models.WorkerModule.getTableName()
	const minGenomeIdClause = lastGenomeId ? `AND a.id > ${lastGenomeId} ` : ''
	const queryUndoModuleArrayString = `ARRAY['${undoModuleIds.join("','")}']`
	const queryModuleArrayString = `ARRAY['${moduleIds.join("','")}']`
	const whereClauses = []

	if (undoModuleIds.length)
		whereClauses.push(`(b.genome_id is not null AND b.modules && ${queryUndoModuleArrayString})`)
	if (moduleIds.length)
		whereClauses.push(`(b.genome_id is null OR NOT b.no_redo_modules @> ${queryModuleArrayString})`)

	const whereClauseSql = whereClauses.join(' OR ')
	const sql =
`WITH done_genomes_modules AS (
	SELECT b.genome_id, array_agg(module) as modules, array_agg(case when redo is false then module else null end) as no_redo_modules
	FROM ${genomesTable} a JOIN ${workerModulesTable} b ON (a.id = b.genome_id)
	WHERE a.worker_id is null AND b.state = 'done'
	GROUP BY b.genome_id
)
SELECT a.*
FROM ${genomesTable} a LEFT OUTER JOIN done_genomes_modules b ON (a.id = b.genome_id)
WHERE ${genomeIdCondition()} a.worker_id is null ${minGenomeIdClause} AND (${whereClauseSql})
ORDER BY a.id
LIMIT 1
FOR UPDATE`

	return app.sequelize.transaction({isolationLevel: kIsolationLevels.READ_COMMITTED}, (transaction) => {
		return app.sequelize.query(sql, {
			model: app.models.Genome,
			type: app.sequelize.QueryTypes.SELECT,
			transaction
		})
		.then((genomes) => {
			if (!genomes.length)
				return null

			return genomes[0].update({
				worker_id: app.worker.id
			}, {
				fields: ['worker_id'],
				transaction
			})
			.then((genome) => {
				logger.info({genomeId: genome.id, name: genome.name}, `Locked genome: ${genome.name}`)
				return genome
			})
		})
	})
}

function genomeIdCondition() {
	return program.genomeIds ? `a.id IN (${program.genomeIds.join(',')}) AND ` : ''
}

function loadGenomeState(app, genome, depGraph) {
	return app.models.WorkerModule.findAll({
		where: {
			genome_id: genome.id
		}
	})
	.then((genomeState) => {
		depGraph.loadState(genomeState)
	})
}

function undoModules(app, genome, unnestedUndoModuleIds, depGraph, moduleClassMap) {
	let effectiveUndoModuleIds = depGraph.doneModuleIds(unnestedUndoModuleIds)
	effectiveUndoModuleIds = depGraph.reverseOrderByDepth(effectiveUndoModuleIds)
	effectiveUndoModuleIds = ModuleId.nest(effectiveUndoModuleIds)
	return Promise.coroutine(function *() {
		for (let moduleId of effectiveUndoModuleIds) {
			shutdownCheck()

			const unnestedModuleIds = moduleId.unnest()
			const dependentModuleIds = new Set()

			unnestedModuleIds.forEach((unnestedModuleId) => {
				for (let x of depGraph.moduleIdsDependingOn(unnestedModuleId))
					dependentModuleIds.add(x)
			})
			if (dependentModuleIds.size) {
				dependentModuleIds = Array.from(dependentModuleIds)
				logger.info({dependentModuleIds: dependentModuleIds.map((x) => x.toString())},
				`Unable to undo: ${moduleId}. The following modules must be undone first: ${dependentModuleIds.join(', ')}`)
				continue
			}

			const ModuleClass = moduleClassMap.get(moduleId.name())
			app.logger = logger.child({
				action: 'undo',
				moduleId: moduleId.toString(),
				genome: {
					id: genome.id,
					name: genome.name
				}
			})
			logger.info(`Undoing module: ${moduleId}`)
			const moduleInstance = new ModuleClass(app, genome, moduleId.subNames())
			const workerModules = depGraph.toNodes(unnestedModuleIds).map((x) => x.workerModule())
			yield moduleInstance.mainUndo(workerModules)
			depGraph.removeState(workerModules)
			logger.info(`Undo finished normally: ${moduleId}`)
		}
	})()
}

function runModules(app, genome, unnestedModuleIds, depGraph, moduleClassMap) {
	let incompleteModuleIds = depGraph.incompleteModuleIds(unnestedModuleIds)
	incompleteModuleIds = depGraph.orderAndNestByDepth(incompleteModuleIds)

	return Promise.coroutine(function *() {
		for (let moduleId of incompleteModuleIds) {
			shutdownCheck()

			const missingDependencies = findMissingDependencies(depGraph, moduleId)
			if (missingDependencies.length) {
				logger.info({missingDependencies}, `Unable to run: ${moduleId}. The following dependencies are not satisfied: ${missingDependencies.join(', ')}`)
				continue
			}

			const ModuleClass = moduleClassMap.get(moduleId.name())
			app.logger = logger.child({
				moduleId: moduleId.toString(),
				genome: {
					id: genome.id,
					name: genome.name
				}
			})
			logger.info(`Starting module: ${moduleId}`)
			const moduleInstance = new ModuleClass(app, genome, moduleId.subNames())
			const workerModules = yield moduleInstance.main()
			depGraph.updateState(workerModules)
			logger.info(`Module finished normally: ${moduleId}`)
		}
	})()
}

function findMissingDependencies(depGraph, moduleId) {
	const unnestedModuleIds = moduleId.unnest()
	for (let i = 0, z = unnestedModuleIds.length; i < z; i++) {
		const missingDependencies = depGraph.missingDependencies(unnestedModuleIds[i])
		if (missingDependencies.length)
			return missingDependencies
	}

	return []
}

function unlockGenome(genome) {
	return genome.update({
		worker_id: null
	}, {fields: ['worker_id']})
	.then(() => {
		logger.info({genome: {id: genome.id, name: genome.name}}, `Unlocked genome: ${genome.name}`)
	})
}
