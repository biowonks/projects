'use strict'

// Local
const AbstractPipelineModule = require('./AbstractPipelineModule')

module.exports =
class OncePipelineModule extends AbstractPipelineModule {
// 	doneModules() {
// 		let sql = `SELECT array_agg(distinct(module)) as done_modules
// FROM ${this.models_.WorkerModule.tableName}
// WHERE genome_id is null AND state = 'done'`

// 		return this.sequelize_.query(sql, {raw: true})
// 		.then((result) => result[0].done_modules)
// 	}
}
