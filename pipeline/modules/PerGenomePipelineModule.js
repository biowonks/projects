'use strict'

// Local
const mutil = require('../lib/mutil'),
	AbstractPipelineModule = require('./AbstractPipelineModule'),
	FileMapper = require('../lib/services/FileMapper')

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

	doneModules() {
		let sql = `SELECT array_agg(module) as done_modules
FROM ${this.models_.WorkerModule.getTableName()}
WHERE genome_id = ? AND state = 'done'`

		return this.sequelize_.query(sql, {
			raw: true,
			type: this.sequelize_.QueryTypes.SELECT,
			replacements: [this.genome_.id]
		})
		.then((result) => result[0].done_modules)
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
