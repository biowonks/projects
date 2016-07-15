#!/usr/bin/env node

'use strict'

// Core
const assert = require('assert'),
	fs = require('fs'),
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
const k1KB = 1024,
	kModulesOncePath = path.resolve(__dirname, 'modules', 'once'),
	kModulesPerGenomePath = path.resolve(__dirname, 'modules', 'per-genome'),
	kShutdownGracePeriodMs = 30000,
	kIsolationLevels = BootService.Sequelize.Transaction.ISOLATION_LEVELS

// Leverage bluebird globally for all Promises
global.Promise = Promise

let availableModules = discoverModules(kModulesOncePath, kModulesPerGenomePath),
	availableOnceModuleNames = availableModules.once.map((x) => x.name),
	availablePerGenomeModuleNames = availableModules.perGenome.map((x) => x.name)

program
.description(`Executes a pipeline of one or more MiST modules. There are two main
  types of modules:

  1. "once" modules run once per pipeline invocation. They are always executed
     prior to any "per-genome" modules. All such modules must be located
     beneath the modules/once folder. Available "once" modules include:

${modulesHelp(availableModules.once)}

  2. "per-genome" modules are serially invoked for one genome at a time before
     processing the next genome. Available "per-genome" modules include:

${modulesHelp(availableModules.perGenome)}

  If no genome-ids are specified via the options, this script will iterate the
  module pipeline for all genomes in the database that have not yet been
  analyzed with at least one of the requested modules. Otherwise, it is only
  applied to the specified genomes with genome-ids.

  # Redo
  When the -r / --redo flag is provided, then all specified modules that are in
  the error state are redone; however, if one or more genome-ids are also
  specified, then all specified modules are redone regardless of their done
  state (excluding those that are active).
`)
.usage('[options] <module ...>')
// .option('-r, --redo', 'Redo specified modules (see description for details)')
.option('-o, --run-once <module,...>', 'CSV list of module names', (value) => value.split(','))
.option('-g, --genome-ids <genome id,...>', 'CSV list of genome ids', parseGenomeIds)
.parse(process.argv)

let onceModuleTexts = program.runOnce || [],
	perGenomeModuleTexts = program.args
if (!onceModuleTexts.length && !perGenomeModuleTexts.length) {
	program.outputHelp()
	process.exit(1)
}

let requestedOnceModules = onceModuleTexts.map(deserializeModuleText),
	requestedPerGenomeModules = perGenomeModuleTexts.map(deserializeModuleText)

dieIfRequestedInvalidModules()

requestedOnceModules.forEach((x) => parseModuleParameters(x, availableModules.once))
requestedPerGenomeModules.forEach((x) => parseModuleParameters(x, availableModules.perGenome))

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
			once: onceModuleTexts,
			perGenome: perGenomeModuleTexts
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

	return runOnceModules(app, requestedOnceModules)
	.then(() => runPerGenomeModules(app, requestedPerGenomeModules))
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
		getModuleRootFiles(srcPath)
		.forEach((moduleRootFile) => {
			try {
				// eslint-disable-next-line global-require
				let moduleClass = require(`${srcPath}/${moduleRootFile}`)
				if (moduleClass.prototype instanceof OncePipelineModule)
					result.once.push(moduleClass)
				else if (moduleClass.prototype instanceof PerGenomePipelineModule)
					result.perGenome.push(moduleClass)
			}
			catch (error) {
				if (!error.code)
					// eslint-disable-next-line no-console
					die(`an unexpected error occurred while parsing module: ${srcPath}/${moduleRootFile}`, error)
				else if (error.code === 'MODULE_NOT_FOUND')
					// eslint-disable-next-line no-console
					console.warn(`WARNING: File could not be loaded: ${srcPath}/${moduleRootFile}\n\n`, error)
			}
		})
	}

	return result
}

function getModuleRootFiles(srcPath) {
	return fs.readdirSync(srcPath)
	.filter((file) => {
		let stat = fs.statSync(path.join(srcPath, file))
		return stat.isDirectory() || (stat.isFile && file.endsWith('.js'))
	})
}

function modulesHelp(modules) {
	if (!modules.length)
		return '     [none]'

	return modules.map(moduleHelp).join('\n')
}

function moduleHelp(module) {
	let help = `     ${module.name}`
	if (module.cli) {
		let cli = module.cli()
		if (cli.usage)
			help += `:${cli.usage}`
		if (cli.description)
			help += `: ${cli.description}`
		if (cli.moreInfo) {
			help += '\n'
			help += '       ' + cli.moreInfo.split('\n').join('\n       ') + '\n'
		}
	}
	return help
}

function deserializeModuleText(moduleText) {
	let matches = /^([\w-]+)(?::([\w-+]+))$/.exec(moduleText),
		result = {
			name: moduleText,
			paramText: null,
			param: null,
			ModuleClass: null,
			subModuleNames: null // e.g. Compute:pfam30
		}

	if (matches) {
		result.name = matches[1]
		result.paramText = matches[2]
	}

	return result
}

function dieIfRequestedInvalidModules() {
	let requestedOnceModuleNames = requestedOnceModules.map((x) => x.name),
		invalidOnceModuleNames = arrayUtil.difference(requestedOnceModuleNames, availableOnceModuleNames)
	if (invalidOnceModuleNames.length)
		die(`the following "once" module(s) are invalid: ${invalidOnceModuleNames.join(', ')}`)

	let requestedPerGenomeModuleNames = requestedPerGenomeModules.map((x) => x.name),
		invalidPerGenomeModuleNames = arrayUtil.difference(requestedPerGenomeModuleNames, availablePerGenomeModuleNames)
	if (invalidPerGenomeModuleNames.length)
		die(`the following "per-genome" module(s) are invalid: ${invalidPerGenomeModuleNames.join(', ')}`)
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

function parseModuleParameters(requestedModule, sourceModules) {
	let ModuleClass = moduleByName(requestedModule.name, sourceModules)
	assert(ModuleClass)
	requestedModule.ModuleClass = ModuleClass

	let cli = ModuleClass.cli()
	if (cli && cli.parse) {
		try {
			requestedModule.param = cli.parse(requestedModule.paramText)
			if (cli.subModuleNames)
				requestedModule.subModuleNames = cli.subModuleNames(requestedModule.param)
		}
		catch (error) {
			die(`An error occurred while parsing the parameters for ${requestedModule.name}`, error)
		}
	}
}

function moduleByName(name, sourceModules) {
	for (let module of sourceModules) {
		if (name === module.name)
			return module
	}

	return null
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
		// case BootService.Sequelize.ValidationError:
		// 	logger.error({errors: error.errors, record: error.record}, shortMessage)
		// 	return
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

function runOnceModules(app, modules) {
	return Promise.each(modules, (module) => {
		shutdownCheck()
		logger.info(`Starting "once" module: ${module.name}`)
		app.logger = logger.child({module: module.name})
		let moduleInstance = new module.ModuleClass(app, module.param)
		return moduleInstance.main()
		.then(() => {
			logger.info(`Module finished normally: ${module.name}`)
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

			for (let module of modules) {
				let ModuleClass = module.ModuleClass
				shutdownCheck()
				app.logger = logger.child({
					module: ModuleClass.name,
					genome: {
						id: genome.id,
						name: genome.name
					}
				})
				logger.info(`Starting module: ${module.name}`)
				let moduleInstance = new ModuleClass(app, genome, module.param)
				yield moduleInstance.main()
				logger.info(`Module finished normally: ${module.name}`)
			}

			yield unlockGenome(genome)
			logger.info({genome: {id: genome.id, name: genome.name}}, `Unlocked genome: ${genome.name}`)
		}
	})()
}

function lockNextGenome(app, modules) {
	let genomesTable = app.models.Genome.tableName,
		workerModulesTable = app.models.WorkerModule.tableName,
		genomeIdClause = program.genomeIds ? `AND a.id IN (${program.genomeIds.join(',')}) ` : '',
		queryModuleNames = flattenModuleNames(modules),
		queryModuleArrayString = `ARRAY['${queryModuleNames.join("','")}']`,
		sql =
`WITH done_genomes_modules AS (
	SELECT b.genome_id, array_agg(module) as modules
	FROM ${genomesTable} a JOIN ${workerModulesTable} b ON (a.id = b.genome_id)
	WHERE a.worker_id is null AND (b.id is null OR b.redo is false) AND b.state = 'done'
	GROUP BY b.genome_id
)
SELECT a.*
FROM ${genomesTable} a LEFT OUTER JOIN done_genomes_modules b ON (a.id = b.genome_id)
WHERE a.worker_id is null ${genomeIdClause} AND (b.genome_id is null OR NOT b.modules @> ${queryModuleArrayString})
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

/**
 * @param {Array.<Object>} modules
 * @returns {Array.<String>} - each item is by default the module name unless subModuleNames is defined, in which case each subModuleNames becomes a separate item
 */
function flattenModuleNames(modules) {
	let result = []

	modules.forEach((module) => {
		if (module.subModuleNames) {
			module.subModuleNames.forEach((x) => {
				result.push(x)
			})
		}
		else {
			result.push(module.name)
		}
	})

	return result
}

function unlockGenome(genome) {
	return genome.update({
		worker_id: null
	}, {fields: ['worker_id']})
}
