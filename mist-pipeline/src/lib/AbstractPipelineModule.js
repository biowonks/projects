'use strict'

// Core
const assert = require('assert')

// Vendor
const Sequelize = require('sequelize')

module.exports =
class AbstractPipelineModule {
	constructor(app) {
		this.config_ = app.config
		this.logger_ = app.logger
		this.query_ = (app.query || '').trim()
		this.models_ = app.models
		this.sequelize_ = app.sequelize
		this.worker_ = app.worker
		this.shutdownCheck_ = app.shutdownCheck
	}

	// ----------------------------------------------------
	// The following static methods are intended as a reference for implementing in derived classes.
	// Given their static nature, they are not inherited and would be meaningless even if they were.
	// Each module class should implement whichever methods are relevant for the CLI.
	/**
	 * @returns {String} - short module description
	 */
	static description() {
		return ''
	}

	/**
	 * @returns {String} - any other helpful information
	 */
	static moreInfo() {
		return ''
	}

	/**
	 * To reference a submodule, simply suffix the module name with a colon and then the submodule
	 * name (e.g. AseqCompute:pfam31).
	 *
	 * @returns {Array.<String>} - one or more "flat" module id strings
	 */
	static dependencies() {
		return [] // this module doesn't depend on anything else
	}

	/**
	 * Example return value:
	 * {
	 *   stp: {
	 *     description: 'predict signal transduction proteins',
	 *     dependencies: [
	 *       'AseqCompute:pfam31',
	 *       'AseqCompute:agfam2',
	 *       ...
	 *     ]
	 *   },
	 *   ...
	 * }
	 *
	 * @returns {Map.<String,Object>} - a map with submodule names as keys that maps to an object with a description and dependencies keys
	 */
	static subModuleMap() {
		return new Map()
	}

	// ----------------------------------------------------
	// Public methods
	/**
	 * @param {Object} options
	 * @param {boolean} options.optimize if true, run optimization routine after each module completes
	 * @returns {Promise.<WorkerModule[]>}
	 */
	main(options) {
		let self = this
		return Promise.coroutine(function *() {
			yield self.setup()
			self.shutdownCheck_()
			let workerModules = yield self.createWorkerModules_()
			try {
				yield self.run()
			}
			catch (error) {
				yield self.updateWorkerModulesState_(workerModules, 'error')
				throw error
			}
			yield self.updateWorkerModulesState_(workerModules, 'done')
			yield self.afterRun()
			self.shutdownCheck_()
			if (options && options.optimize) {
				yield self.optimize()
				self.shutdownCheck_()
			}
			yield self.teardown()
			return workerModules
		})()
	}

	/**
	 * @param {Array.<WorkerModule>} workerModules
	 * @param {Object} options
	 * @param {boolean} options.optimize if true, run optimization routine after each module completes
	 * @returns {Promise.<void>}
	 */
	mainUndo(workerModules, options) {
		let self = this
		return Promise.coroutine(function *() {
			yield self.setup()
			self.shutdownCheck_()
			let priorWorkerModuleStates = workerModules.map((x) => x.state)
			yield self.updateWorkerModulesState_(workerModules, 'undo')
			try {
				yield self.undo()
			}
			catch (error) {
				yield self.restorePriorState_(workerModules, priorWorkerModuleStates)
				throw error
			}
			yield self.deleteWorkerModules_(workerModules)
			if (options && options.optimize)
				yield self.optimize()
			self.shutdownCheck_()
			yield self.teardown()
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
		throw new Error('not implemented')
	}

	run() {
		throw new Error('not implemented')
	}

	afterRun() {
	}

	optimize() {
	}

	teardown() {
	}

	analyze(...tableNames) {
		return Promise.each(tableNames, (tableName) => {
			this.logger_.info({tableName: tableName.toString()}, `Analyzing table: ${tableName}`)
			return this.sequelize_.query(`ANALYZE ${tableName}`, {raw: true})
		})
	}

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
	/**
	 * The pipeline will attempt to redo modules that are in the error state. Thus, it is likely
	 * that a worker module will already exist. This method first destroys any existing worker
	 * module records and then creates a new batch for each worker module record reported by child
	 * modules implementations.
	 *
	 * @returns {Promise.<WorkerModule>}
	 */
	createWorkerModules_() {
		// Most modules will only have one corresponding WorkerModule; however, in some cases,
		// such as AseqCompute, there may be multiple worker modules. Thus, dealing with an array
		// or worker modules is supported here.
		let workerModuleRecords = this.workerModuleRecords()
		return this.sequelize_.transaction((transaction) => {
			return this.models_.WorkerModule.destroy({
				where: {
					genome_id: workerModuleRecords[0].genome_id,
					state: 'error',
					module: {
						[Sequelize.Op.in]: workerModuleRecords.map((x) => x.module)
					}
				},
				transaction
			})
			.then(() => {
				return this.models_.WorkerModule.bulkCreate(workerModuleRecords, {
					validate: true,
					returning: true,
					transaction
				})
			})
		})
	}

	/**
	 * @param {Array.<WorkerModule>} workerModules
	 * @returns {Promise}
	 */
	deleteWorkerModules_(workerModules) {
		return this.sequelize_.transaction((transaction) => {
			return Promise.each(workerModules, (workerModule) => {
				return workerModule.destroy({transaction})
			})
		})
	}

	/**
	 * Updates the state of multiple worker modules to ${newState}
	 *
	 * @param {Array.<WorkerModule>} workerModules
	 * @param {String} newState
	 * @returns {Promise}
	 */
	updateWorkerModulesState_(workerModules, newState) {
		return this.sequelize_.transaction((transaction) => {
			return Promise.each(workerModules, (workerModule) => {
				return workerModule.updateState(newState, transaction)
			})
		})
	}

	restorePriorState_(workerModules, priorWorkerModuleStates) {
		assert(workerModules.length === priorWorkerModuleStates.length)

		return this.sequelize_.transaction((transaction) => {
			return Promise.each(workerModules, (workerModule, i) => {
				return workerModule.updateState(priorWorkerModuleStates[i], transaction)
			})
		})
	}
}
