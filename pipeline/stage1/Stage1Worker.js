'use strict'

// Vendor
const Promise = require('bluebird')

// Local
const BaseWorker = require('./BaseWorker'),
	BootService = require('../../services/BootService'),
	WorkerService = require('../../services/WorkerService')

// Constants
const kIsolationLevels = BootService.Sequelize.Transaction.ISOLATION_LEVELS

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
	}

	logger() {
		return this.logger_ || super.logger()
	}

	main() {
		this.setup_()
		.then(this.processNextGenome_.bind(this))
		.catch((error) => {
			let logger = this.logger()
			if (error instanceof BootService.Sequelize.DatabaseError)
				logger.error({name: error.name, sql: error.sql}, error.message)
			else if (error instanceof BaseWorker.InterruptError)
				logger.error('Process was interrupted')
			else
				logger.error({error, stack: error.stack}, `Unexpected error: ${error.message}`)
		})
		.finally(() => this.teardown_())
	}

	// ----------------------------------------------------
	// Protected event handlers
	onTeardown_() {
		return this.unregisterWorker_()
	}

	// ----------------------------------------------------
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
		this.interruptCheck()
		this.subLogger_ = null

		return this.acquireQueuedGenome_()
		.then((queuedGenome) => {
			this.queuedGenome_ = queuedGenome
			if (!queuedGenome) {
				this.logger().info('No outstanding genomes found in the database')
				return null
			}

			this.interruptCheck()

			this.subLogger_ = this.logger_.child({
				refseqAssemblyAccession: queuedGenome.refseq_assembly_accession,
				source: queuedGenome.name
			})
			this.subLogger_.info(`Processing queued genome: ${queuedGenome.name}`)

			return this.teardown_()
		})
	}

	acquireQueuedGenome_() {
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
				if (!queuedGenome)
					return null

				queuedGenome.worker_id = this.worker_.id
				return queuedGenome.save({fields: ['worker_id']})
			})
		})
	}
}
