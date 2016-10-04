'use strict'

// Core
const assert = require('assert')

module.exports =
class AbstractSeqsService {
	constructor(model, logger) {
		this.model_ = model
		this.logger_ = logger
		this.sequelize_ = model.sequelize
		this.attributes_ = Object.keys(this.model_.rawAttributes)

		assert(this.logger_, 'Missing logger argument')
	}

	insertIgnoreSeqs(seqs, fields, transaction) {
		if (!seqs.length)
			return Promise.resolve()

		let records = seqs.map(this.model_.dataFromSeq),
			sql = this.model_.QueryGenerator.bulkInsertQuery(
				this.model_.getTableName(),
				records,
				{fields},
				this.attributes_
			)

		if (sql.endsWith(';'))
			sql = sql.slice(0, -1)

		sql += ' ON CONFLICT DO NOTHING;'

		return this.model_.sequelize.query(sql, {
			raw: true,
			transaction
		})
	}
}
