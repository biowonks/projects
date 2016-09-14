'use strict'

// Core
const os = require('os'),
	path = require('path')

// Local
const mutil = require('mist-lib/mutil'),
	AbstractPipelineModule = require('./AbstractPipelineModule'),
	FileMapper = require('./services/FileMapper')

// Constants
const kRootTmpDirectory = path.join(os.tmpdir(), 'biowonks')

module.exports =
class PerGenomePipelineModule extends AbstractPipelineModule {
	constructor(app, genome) {
		super(app)

		this.genome_ = genome
		this.fileMapper_ = new FileMapper(kRootTmpDirectory, genome)
		this.dataDirectory_ = this.fileMapper_.genomeRootPath()
	}

	setup() {
		if (this.needsDataDirectory())
			return this.ensureDataDirectoryExists_()

		return null
	}

	newWorkerModuleData() {
		let workerModuleData = super.newWorkerModuleData()
		workerModuleData.genome_id = this.genome_.id
		return workerModuleData
	}

	teardown() {
		if (this.needsDataDirectory()) {
			return mutil.rimraf(this.dataDirectory_)
			.then(() => {
				this.logger_.info({dataDirectory: this.dataDirectory_}, 'Removed data directory')
			})
		}

		return null
	}

	// ----------------------------------------------------
	// Protected methods
	needsDataDirectory() {
		return false
	}

	// ----------------------------------------------------
	// Private methods
	ensureDataDirectoryExists_() {
		return mutil.mkdirp(this.dataDirectory_)
		.then((result) => {
			if (result.created)
				this.logger_.info({dataDirectory: this.dataDirectory_}, 'Created data directory')
		})
	}
}
