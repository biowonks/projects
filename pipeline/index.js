'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const program = require('commander'),
	Promise = require('bluebird')

// Local
const BootService = require('../services/BootService'),
	WorkerService = require('../services/WorkerService'),
	InterruptError = require('./lib/errors/InterruptError')

// Constants
const kModulesOncePath = path.resolve(__dirname, 'modules', 'once'),
	kModulesPerGenomePath = path.resolve(__dirname, 'modules', 'per-genome'),
	kShutdownGracePeriodMs = 30000

let availableOnceModuleNames = enumerateModules(kModulesOncePath),
	availablePerGenomeModuleNames = enumerateModules(kModulesPerGenomePath)

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

// Are the requested modules legitimate?
let invalidModuleNames = [
	...difference(onceModuleNames, availableOnceModuleNames),
	...difference(perGenomeModuleNames, availablePerGenomeModuleNames)
]
if (invalidModuleNames.length) {
	// eslint-disable-next-line no-console
	console.error(`FATAL: Module(s) does not exist: ${invalidModuleNames.join(', ')}\n` +
		'-'.repeat(60)) // eslint-disable-line
	program.outputHelp()
	process.exit(1)
}

let onceModules = readyModules(kModulesOncePath, onceModuleNames),
	// perGenomeModules = readyModules(kModulesPerGenomePath, perGenomeModuleNames),
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
	.then(() => runPerGenomeModules(app))
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
function enumerateModules(srcPath) {
	return fs.readdirSync(srcPath)
	.filter((file) => fs.statSync(path.join(srcPath, file)).isDirectory())
}

function parseGenomeIds(csvGenomeIds) {
	if (!csvGenomeIds)
		return null

	let ids = new Set(csvGenomeIds.split(',').map((genomeId) => Number(genomeId)))
	for (let genomeId of ids) {
		if (!/^[1-9]\d*$/.test(genomeId))
			throw new Error('Each genome id must be a positive integer')
	}

	return ids
}

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {Array} elements in ${a} that are not in ${b}
 */
function difference(a, b) {
	let bSet = new Set(b)
	return a.filter((x) => !bSet.has(x))
}

function readyModules(srcPath, moduleNames) {
	let result = []
	for (let name of moduleNames) {
		try {
			result.push({
				name,
				main: require(`${srcPath}/${name}`) // eslint-disable-line global-require
			})
		}
		catch (error) {
			if (error.code === 'MODULE_NOT_FOUND') {
				// eslint-disable-next-line no-console
				console.error(`FATAL: Module could not be loaded: ${name}\n\n`, error)
				process.exit(1)
			}

			throw error
		}
	}
	return result
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
	return Promise.coroutine(function *() {
		for (let module of modules) {
			shutdownCheck()
			app.logger = logger.child({module: module.name})
			logger.info(`Starting "once" module: ${module.name}`)

			let workerModule = yield app.models.WorkerModule.create({
				worker_id: app.worker.id,
				module: module.name,
				state: 'active',
				started_at: app.sequelize.fn('clock_timestamp')
			})
			try {
				yield module.main(app)
			}
			catch (error) {
				yield workerModule.updateState('error')
				throw error
			}
			yield workerModule.updateState('done')
			logger.info(`Module finished normally: ${module.name}`)
		}
	})()
}

function runPerGenomeModules() {

}
