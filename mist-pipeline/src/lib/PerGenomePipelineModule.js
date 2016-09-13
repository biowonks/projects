'use strict'

// Local
const mutil = require('mist-lib/mutil'),
	AbstractPipelineModule = require('./AbstractPipelineModule'),
	FileMapper = require('./services/FileMapper')

module.exports =
class PerGenomePipelineModule extends AbstractPipelineModule {
	constructor(app, genome) {
		super(app)

		this.genome_ = genome
		this.fileMapper_ = new FileMapper(this.config_.paths.genomes, genome)
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
