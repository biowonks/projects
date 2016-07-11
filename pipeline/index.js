'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const program = require('commander'),
	Promise = require('bluebird')

// Local
const arrayUtil = require('./lib/array-util'),
	BootService = require('../services/BootService'),
	WorkerService = require('../services/WorkerService'),
	InterruptError = require('./lib/errors/InterruptError'),
	OncePipelineModule = require('./modules/OncePipelineModule'),
	PerGenomePipelineModule = require('./modules/PerGenomePipelineModule')

// Constants
const kModulesOncePath = path.resolve(__dirname, 'modules', 'once'),
	kModulesPerGenomePath = path.resolve(__dirname, 'modules', 'per-genome'),
	kShutdownGracePeriodMs = 30000,
	kIsolationLevels = BootService.Sequelize.Transaction.ISOLATION_LEVELS

let availableModules = discoverModules(kModulesOncePath, kModulesPerGenomePath),
	availableOnceModuleNames = availableModules.once.map((x) => x.name),
	availablePerGenomeModuleNames = availableModules.perGenome.map((x) => x.name)

// let availableOnceModuleNames = enumerateModules(kModulesOncePath),
// 	availablePerGenomeModuleNames = enumerateModules(kModulesPerGenomePath)

// Leverage bluebird globally for all Promises
global.Promise = Promise

program
.description(`Executes a pipeline of one or more MiST modules. There are two main
  types of modules:

  1. "once" modules run once per pipeline invocation. They are always executed
     prior to any "per-genome" modules. All such modules must be located
     beneath the modules/once folder. Available "once" modules include:

       ${(availableOnceModuleNames || ['[none]']).join('\n       ')}

  2. "per-genome" modules are serially invoked for one genome at a time before
     processing the next genome. Available "per-genome" modules include:

       ${(availablePerGenomeModuleNames || ['[none]']).join('\n       ')}

  If no genome-ids are specified via the options, this script will iterate the
  module pipeline for all genomes in the database that have not yet been
  analyzed with at least one of the requested modules. Otherwise, it is only
  applied to the specified genomes with genome-ids.
`)
.usage('[options] <module ...>')
.option('-r, --run-once <module,...>', 'CSV list of module names', (value) => value.split(','))
.option('-g, --genome-ids <genome id,...>', 'CSV list of genome ids', parseGenomeIds)
.parse(process.argv)

let onceModuleNames = program.runOnce || [],
	perGenomeModuleNames = program.args
if (!onceModuleNames.length && !perGenomeModuleNames.length) {
	program.outputHelp()
	process.exit(1)
}

dieIfRequestedInvalidModules()

let onceModules = modulesByName(onceModuleNames, availableModules.once),
	perGenomeModules = modulesByName(perGenomeModuleNames, availableModules.perGenome),
	bootService = new BootService({
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
			once: onceModuleNames,
			perGenome: perGenomeModuleNames
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

	return runOnceModules(app, onceModules)
	.then(() => runPerGenomeModules(app, perGenomeModules))
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
function discoverModules(...srcPaths) {
	let result = {
		once: [],
		perGenome: []
	}

	for (let srcPath of srcPaths) {
		getJsFiles(srcPath)
		.forEach((jsFile) => {
			try {
				// eslint-disable-next-line global-require
				let moduleClass = require(`${srcPath}/${jsFile}`)
				if (moduleClass.prototype instanceof OncePipelineModule)
					result.once.push(moduleClass)
				else if (moduleClass.prototype instanceof PerGenomePipelineModule)
					result.perGenome.push(moduleClass)
			}
			catch (error) {
				if (error.code === 'MODULE_NOT_FOUND')
					// eslint-disable-next-line no-console
					console.warn(`WARNING: File could not be loaded: ${srcPath}/${jsFile}\n\n`, error)
			}
		})
	}

	return result
}

function getJsFiles(srcPath) {
	return fs.readdirSync(srcPath)
	.filter((file) => file.endsWith('.js') && fs.statSync(path.join(srcPath, file)).isFile())
}

function dieIfRequestedInvalidModules() {
	let invalidOnceModuleNames = arrayUtil.difference(onceModuleNames, availableOnceModuleNames)
	if (invalidOnceModuleNames.length)
		die(`the following "once" module(s) are invalid: ${invalidOnceModuleNames.join(', ')}`)
	let invalidPerGenomeModuleNames = arrayUtil.difference(perGenomeModuleNames, availablePerGenomeModuleNames)
	if (invalidPerGenomeModuleNames.length)
		die(`the following "per-genome" module(s) are invalid: ${invalidPerGenomeModuleNames.join(', ')}`)
}

function die(message) {
	// eslint-disable-next-line no-console
	console.error(`FATAL: ${message}\n` + '-'.repeat(60)) // eslint-disable-line
	program.outputHelp()
	process.exit(1)
}

function modulesByName(names, sourceModules) {
	let result = []

	for (let name of names) {
		for (let module of sourceModules) {
			if (name === module.name) {
				result.push(module)
				break
			}
		}
	}

	return result
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
	switch (error.constructor) {
		case BootService.Sequelize.DatabaseError:
			logger.error({name: error.name, sql: error.sql}, error.message)
			return
		case InterruptError:
			logger.error(error.message)
			return

		default:
			logger.error({error, stack: error.stack}, `Unhandled error: ${error.message}`)
			return
	}
}

function saveWorkerError(error) {
	if (!worker)
		return Promise.resolve()

	logger.info('Updating worker status')
	worker.active = false
	worker.normal_exit = false
	worker.error_message = error.message
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

function runOnceModules(app, modules) {
	return Promise.each(modules, (ModuleClass) => {
		shutdownCheck()
		logger.info(`Starting "once" module: ${ModuleClass.name}`)
		app.logger = logger.child({module: ModuleClass.name})
		let module = new ModuleClass(app)
		return module.main()
		.then(() => {
			logger.info(`Module finished normally: ${ModuleClass.name}`)
		})
	})
}

function runPerGenomeModules(app, modules) {
	if (!modules.length)
		return null

	return Promise.coroutine(function *() {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			shutdownCheck()
			let genome = yield lockNextGenome(app, modules)
			if (!genome)
				break

			logger.info({genomeId: genome.id, name: genome.name}, `Locked genome: ${genome.name}`)

			for (let ModuleClass of modules) {
				shutdownCheck()
				app.logger = logger.child({
					module: ModuleClass.name,
					genomeId: genome.id,
					name: genome.name
				})
				logger.info(`Starting module: ${ModuleClass.name}`)
				let module = new ModuleClass(app, genome)
				yield module.main()
				logger.info(`Module finished normally: ${ModuleClass.name}`)
			}

			yield unlockGenome(genome)
			logger.info({genomeId: genome.id, name: genome.name}, `Unlocked genome: ${genome.name}`)
		}
	})()
}

function lockNextGenome(app, modules) {
	let genomesTable = app.models.Genome.tableName,
		workerModulesTable = app.models.WorkerModule.tableName,
		genomeIdClause = program.genomeIds ? `a.id IN (${program.genomeIds.join(',')}) ` : 'b.genome_id is null',
		queryModuleArrayString = `ARRAY['${modules.map((module) => module.name).join("','")}']`,
		sql =
`WITH done_genomes_modules AS (
	SELECT b.genome_id, array_agg(module) as modules
	FROM ${genomesTable} a JOIN ${workerModulesTable} b ON (a.id = b.genome_id)
	WHERE a.worker_id is null AND (b.id is null OR b.redo is false)
	GROUP BY b.genome_id
)
SELECT a.*
FROM ${genomesTable} a LEFT OUTER JOIN done_genomes_modules b ON (a.id = b.genome_id)
WHERE a.worker_id is null AND (${genomeIdClause} or NOT b.modules @> ${queryModuleArrayString})
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
