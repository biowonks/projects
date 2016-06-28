'use strict'

// Vendor
const Promise = require('bluebird')

// Local
const BaseWorker = require('./BaseWorker'),
	BootService = require('../../services/BootService'),
	FileMapper = require('./FileMapper'),
	WorkerService = require('../../services/WorkerService'),
	tasks = require('./tasks')

// Constants
const kIsolationLevels = BootService.Sequelize.Transaction.ISOLATION_LEVELS

// --------------------------------------------------------
class NothingLeftToDoError extends Error {}

module.exports =
class Stage1Worker extends BaseWorker {
	constructor() {
		super()

		this.bootService_ = null
		this.workerService_ = null
		this.config_ = BootService.config
		this.logger_ = null
		this.subLogger_ = null
		this.models_ = null
		this.worker_ = null
		this.queuedGenome_ = null
		this.context_ = null
	}

	logger() {
		return this.logger_ || super.logger()
	}

	main() {
		return this.setup_()
		.then(this.processNextGenome_.bind(this))
		.catch(this.handleError_.bind(this))
		.catch((handleErrorError) => { // In case an error occurs while error handling
			this.logError_(handleErrorError)
			return this.teardown_(handleErrorError)
		})
		.catch(this.logError_.bind(this)) // And in case an error occurs during teardown
	}

	// ----------------------------------------------------
	// Protected event handlers
	onTeardown_(error = null) {
		return !error || error.constructor === NothingLeftToDoError ? this.unregisterWorker_() : Promise.resolve()
	}

	// ----------------------------------------------------
	handleError_(error) {
		this.logError_(error)

		if (!this.sequelize_)
			return Promise.resolve()

		return this.sequelize_.transaction(() => {
			return this.updateWorkerError_(error)
			.then(this.releaseQueuedGenome_.bind(this))
		})
		.then(this.teardown_.bind(this, error))
		.catch(this.logError_.bind(this))
	}

	logError_(error) {
		let logger = this.logger()
		switch (error.constructor) {
			case BootService.Sequelize.DatabaseError:
				logger.error({name: error.name, sql: error.sql}, error.message)
				break
			case BaseWorker.InterruptError:
				logger.error(error.message)
				break
			case NothingLeftToDoError:
				logger.info('All outstanding genomes have been processed')
				break
			default:
				logger.error({error, stack: error.stack}, `Unhandled error: ${error.message}`)
				break
		}
	}

	updateWorkerError_(error) {
		if (error.constructor === NothingLeftToDoError || !this.worker_)
			return Promise.resolve()

		this.logger().info('Updating worker database status')
		this.worker_.normal_exit = false
		this.worker_.error_message = error.message
		if (this.queuedGenome_)
			this.worker_.job.genomes_queue_id = this.queuedGenome_.id
		return this.worker_.save({fields: ['normal_exit', 'error_message', 'job']})
		.catch(BootService.Sequelize.DatabaseError, () => {
			// When would this ever happen? One example is the GenbankReaderStream reading in
			// compressed gzip data (vs the uncompressed raw text) and including in the error
			// message the binary data line.
			this.worker_.error_message = 'Error message could not be saved to the database. ' +
				'Please check the logs for contextual details.'
			return this.worker_.save({fields: ['normal_exit', 'error_message', 'job']})
		})
	}

	/**
	 * @returns {Promise}
	 */
	setup_() {
		this.bootService_ = this.createBootService_()
		this.logger_ = this.bootService_.logger()
		return this.bootService_.setup()
		.then(() => {
			this.interruptCheck()
			this.sequelize_ = this.bootService_.sequelize()
			this.models_ = this.bootService_.models()
			return this.bootService_.publicIP()
		})
		.then((publicIP) => {
			this.interruptCheck()
			this.workerService_ = new WorkerService(this.models_, publicIP)
			this.worker_ = this.workerService_.buildWorker()
			return this.worker_.save()
		})
		.then((worker) => {
			this.logger_ = this.logger_.child({
				workerId: worker.id,
				ip: worker.public_ip
			})
			this.logger_.info('Registered new worker')
			this.interruptCheck()
		})
	}

	createBootService_() {
		return new BootService({
			logger: {
				name: 'stage1.worker',
				streams: [
					{
						level: 'info',
						stream: process.stdout
					}
				]
			}
		})
	}

	releaseQueuedGenome_() {
		if (!this.worker_)
			return Promise.resolve()

		return this.models_.GenomesQueue.update({worker_id: null}, {
			where: {
				worker_id: this.worker_.id
			}
		})
	}

	unregisterWorker_() {
		if (!this.worker_)
			return Promise.resolve()

		this.logger().info('Unregistering worker')
		return this.worker_.destroy()
		.then(() => {
			this.worker_ = null
		})
	}

	processNextGenome_() {
		return this.acquireQueuedGenome_()
		.then(this.runTasks_.bind(this))
		.then(this.processNextGenome_.bind(this))
	}

	acquireQueuedGenome_() {
		this.interruptCheck()
		this.subLogger_ = null

		return this.sequelize_.transaction({isolationLevel: kIsolationLevels.READ_COMMITTED},
		(transaction) => {
			return this.models_.GenomesQueue.findOne({
				where: {
					worker_id: null
				},
				order: 'id',
				lock: transaction.LOCK.UPDATE
			})
			.then((queuedGenome) => {
				this.queuedGenome_ = queuedGenome
				if (!queuedGenome)
					throw new NothingLeftToDoError()

				queuedGenome.worker_id = this.worker_.id
				return queuedGenome.save({fields: ['worker_id']})
			})
		})
	}

	runTasks_() {
		this.interruptCheck()
		this.setupSubLogger_()
		this.subLogger_.info(`Processing queued genome: ${this.queuedGenome_.name}`)

		let context = {
			logger: this.subLogger_,
			fileMapper: new FileMapper(this.config_.pipeline.paths.genomes, this.queuedGenome_),
			config: this.config_,
			models: this.models_,
			sequelize: this.sequelize_,
			interruptCheck: this.interruptCheck.bind(this)
		}

		return tasks.run(this.queuedGenome_, context)
	}

	setupSubLogger_() {
		this.subLogger_ = this.logger_.child({
			refseqAssemblyAccession: this.queuedGenome_.refseq_assembly_accession,
			source: this.queuedGenome_.name
		})
	}
}
