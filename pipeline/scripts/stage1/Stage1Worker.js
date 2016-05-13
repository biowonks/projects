'use strict'

// Core node libraries
let fs = require('fs'),
	path = require('path')

// Local includes
let mutil = require('../lib/mutil'),
	FileNameMapper = require('./FileNameMapper'),
	NCBIDataHelper = require('./NCBIDataHelper'),
	CoreDataBuilder = require('./CoreDataBuilder'),

	// Services
	IdAllocator = require('./IdAllocator')

class Stage1Worker {
	constructor(config, logger) {
		this.config_ = config
		this.logger_ = logger.child({role: 'worker'})
		this.sequelize_ = null
		this.models_ = null
		this.services_ = {}

		this.refseqAssemblyAccession_ = null
		this.genome_ = null

		this.fileNameMapper_ = new FileNameMapper(config)
		this.ncbiDataHelper_ = null
		this.coreDataBuilder_ = null

		process.on('message', this.onMessage.bind(this))
	}

	onMessage(message) {
		if (/^setup\s/.test(message)) {
			this.refseqAssemblyAccession_ = this.getRefseqAssemblyAccession_(message)
			if (!this.refseqAssemblyAccession_) {
				let errorMessage = 'Invalid setup message: missing Refseq Assembly Accession'
				this.logger_.error(errorMessage)
				throw new Error(errorMessage)
			}

			this.setup()
		}

		if (message === 'start')
			this.main()
	}

	setup() {
		this.logger_.info({refseq_assembly_accession: this.refseqAssemblyAccession_}, 'setup')
		mutil.initORM(this.config_, this.logger_)
		.catch((error) => {
			this.logger_.error({error: error, stack: error.stack}, 'Setup database failed')
			process.send('error db')
			process.exit(1)
		})
		.then((result) => {
			this.sequelize_ = result.sequelize
			this.models_ = result.models

			return this.models_.GenomeQueue.findById(this.refseqAssemblyAccession_)
		})
		.then((genome) => {
			let genomeNotFound = !genome
			if (genomeNotFound) {
				this.logger_.warn({refseq_assembly_accession: this.refseqAssemblyAccession_}, 'RefSeq Assembly Accession not found in the database. Ignoring this request')
				process.send('done')
				process.exit()
				return
			}

			this.genome_ = genome
			this.fileNameMapper_.setGenome(genome)
			this.logger_ = this.logger_.child(genome.short())

			return mutil.mkdir(this.fileNameMapper_.genomeRootPath())
		})
		.then((result) => {
			if (result.created)
				this.logger_.info({directory: result.directory}, 'Created root genome path')

			this.ncbiDataHelper_ = new NCBIDataHelper(this.fileNameMapper_, this.logger_)

			process.send('ready')
		})
		.catch((error) => {
			this.logger_.error({error: error, stack: error.stack}, 'Setup error')
			process.send('error setup')
			process.exit(1)
		})
	}

	// ----------------------------------------------------
	main() {
		this.ncbiDataHelper_.downloadAll()
		.then(() => {
			this.logger_.info('Download complete')

			this.setupServices_()

			this.coreDataBuilder_ = new CoreDataBuilder(this.services_, this.models_, this.fileNameMapper_, this.logger_)
			return this.coreDataBuilder_.main()
		})
		.then(() => {
			this.logger_.info('Core data complete')
		})
		.catch((error) => {
			if (error) {
				this.logger_.error('Unhandled error ' + error, error)
				process.exit(1)
				return
			}

			// Otherwise - exit normally
			process.exit()
		})
	}

	// ----------------------------------------------------
	// Private methods
	getRefseqAssemblyAccession_(message) {
		let matches = /^\S+\s+(\S+)/.exec(message)
		return matches ? matches[1] : null
	}

	setupServices_() {
		this.services_.idAllocator = new IdAllocator(this.models_.IdSequence, this.logger_)
	}
}

module.exports = Stage1Worker
