'use strict'

// Local
const AbstractPipelineModule = require('./AbstractPipelineModule')

module.exports =
class PerGenomePipelineModule extends AbstractPipelineModule {
	constructor(app, genome) {
		super(app)

		this.genome_ = genome
	}

	doneModules() {
		let sql = `SELECT array_agg(distinct(module)) as done_modules
FROM ${this.models_.WorkerModule.tableName}
WHERE genome_id is ? AND state = 'done'`

		return this.sequelize_.query(sql, {raw: true, replacements: [this.genome_.id]})
		.then((result) => result[0].done_modules)
	}

	newWorkerData() {
		let workerData = super.newWorkerData()
		workerData.genome_id = this.genome_.id
		return workerData
	}
}
