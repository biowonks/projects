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
	dependencies() {
		return []
	}

	main(options = {}) {
		let self = this
		return Promise.coroutine(function *() {
			let missingDependencies = self.missingDependencies()
			if (missingDependencies.length) {
				self.logger_.warning({missingDependencies}, 'Missing one or more dependencies')
				return null
			}

			let workerModule = yield self.models_.WorkerModule.create(self.newWorkerData())
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
				yield workerModule.updateState('error')
				throw error
			}
			yield workerModule.updateState('done')
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

	missingDependencies() {
		// Shortcut :)
		let deps = this.dependencies()
		if (!deps.length)
			return Promise.resolve([])

		return this.doneModules()
		.then((doneModules) => {
			return arrayUtil.difference(deps, doneModules)
		})
	}

	doneModules() {
		throw new Error('not implemented')
	}

	newWorkerData() {
		return {
			worker_id: this.worker_.id,
			module: this.name(),
			state: 'active',
			started_at: this.sequelize_.fn('clock_timestamp')
		}
	}
}
