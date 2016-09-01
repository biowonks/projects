'use strict'

// Local
const mutil = require('../mist-lib/mutil'),
	AbstractPipelineModule = require('./AbstractPipelineModule'),
	FileMapper = require('./services/FileMapper')

module.exports =
class PerGenomePipelineModule extends AbstractPipelineModule {
	constructor(app, genome) {
		super(app)

		this.genome_ = genome
		this.fileMapper_ = new FileMapper(this.config_.pipeline.paths.genomes, genome)
		this.dataDirectory_ = this.fileMapper_.genomeRootPath()
	}

	setup() {
		return this.ensureDataDirectoryExists_()
	}

	newWorkerModuleData() {
		let workerModuleData = super.newWorkerModuleData()
		workerModuleData.genome_id = this.genome_.id
		return workerModuleData
	}

	// ----------------------------------------------------
	// Private methods
	ensureDataDirectoryExists_() {
		return mutil.mkdir(this.dataDirectory_)
		.then((result) => {
			if (result.created)
				this.logger_.info({dataDirectory: this.dataDirectory_}, 'Created data directory')
		})
	}
}
