'use strict'

// Local
const arrayUtil = require('../lib/array-util')

module.exports =
class AbstractPipelineModule {
	constructor(app) {
		this.config_ = app.config
		this.logger_ = app.logger
		this.models_ = app.models
		this.sequelize_ = app.sequelize
		this.worker_ = app.worker
		this.shutdownCheck_ = app.shutdownCheck
	}

	// --------------
	// Public methods
	// dependencies() {
	// 	return []
	// }

	main(options = {}) {
		let self = this
		return Promise.coroutine(function *() {
			// let missingDependencies = yield self.missingDependencies()
			// if (missingDependencies.length) {
			// 	self.logger_.warn({missingDependencies}, 'Missing one or more dependencies')
			// 	return null
			// }

			// Most modules will only have one corresponding WorkerModule; however, in some cases,
			// such as Compute, there may be multiple worker modules. Thus, dealing with an array
			// or worker modules is supported here.
			let workerModuleRecords = yield self.workerModuleRecords(),
				workerModules = yield self.models_.WorkerModule.bulkCreate(workerModuleRecords, {
					validate: true,
					returning: true
				})

			// let workerModule = yield self.models_.WorkerModule.create(self.newWorkerModuleData())
			try {
				self.shutdownCheck_()
				yield self.setup()
				self.shutdownCheck_()
				if (options.redo) {
					yield self.undo()
					self.shutdownCheck_()
				}
				yield self.run()
				self.shutdownCheck_()
				yield self.optimize()
				self.shutdownCheck_()
				yield self.teardown()
			}
			catch (error) {
				yield self.updateWorkerModulesState_(workerModules, 'error')
				throw error
			}
			yield self.updateWorkerModulesState_(workerModules, 'done')
			return null
		})()
	}

	name() {
		return this.constructor.name
	}

	// -----------------
	// Protected methods
	setup() {
	}

	undo() {
	}

	run() {
		throw new Error('not implemented')
	}

	optimize() {
	}

	teardown() {
	}

	analyze(...tableNames) {
		return Promise.each(tableNames, (tableName) => {
			this.logger_.info({tableName}, `Analyzing table: ${tableName}`)
			return this.sequelize_.query(`ANALYZE ${tableName}`, {raw: true})
		})
	}

	// missingDependencies() {
	// 	// Shortcut :)
	// 	let deps = this.dependencies()
	// 	if (!deps.length)
	// 		return Promise.resolve([])

	// 	return this.doneModules()
	// 	.then((doneModules) => {
	// 		return arrayUtil.difference(deps, doneModules)
	// 	})
	// }

	// doneModules() {
	// 	throw new Error('not implemented')
	// }

	workerModuleRecords() {
		return [this.newWorkerModuleData()]
	}

	newWorkerModuleData() {
		return {
			worker_id: this.worker_.id,
			module: this.name(),
			state: 'active',
			started_at: this.sequelize_.fn('clock_timestamp')
		}
	}

	// ----------------------------------------------------
	// Private methods
	updateWorkerModulesState_(workerModules, newState) {
		return this.sequelize_.transaction((transaction) => {
			return Promise.each(workerModules, (workerModule) => {
				return workerModule.updateState(newState, transaction)
			})
		})
	}
}
