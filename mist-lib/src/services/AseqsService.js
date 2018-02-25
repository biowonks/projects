/* eslint-disable valid-jsdoc */

'use strict'

// Local
const AbstractSeqsService = require('./AbstractSeqsService')

module.exports =
class AseqsService extends AbstractSeqsService {
	/**
	 * @param {Array.<Seq>} seqs
	 * @param {Transaction} [transaction=null]
	 * @returns {Promise}
	 */
	insertIgnoreSeqs(seqs, transaction = null) {
		return super.insertIgnoreSeqs(seqs, ['id', 'length', 'sequence'], transaction)
	}

	unanalyzedAseqs(genomeId, toolId, optFields, optTransaction) {
		const {Component, Gene, Aseq} = this.models_
		let fields = ''
		if (Array.isArray(optFields) && optFields.length)
			fields = ', ' + optFields.join(', ')
		const sql = `
SELECT c.id ${fields}
FROM ${Component.getTableName()} a JOIN ${Gene.getTableName()} b ON (a.id = b.component_id)
	JOIN ${Aseq.getTableName()} c ON (b.aseq_id = c.id)
WHERE a.genome_id = ? AND b.aseq_id is not null and (${toolId} is not null)
ORDER BY b.id`

		return this.sequelize_.query(sql, {
			model: this.models_.Aseq,
			replacements: [genomeId],
			transaction: optTransaction
		})
	}

	/**
	 * Fetches toolIds data from the database and merges it into ${aseqs}. If an Aseq and the
	 * database record both contain non-null data, the database value takes precedence.
	 *
	 * @param {Array.<Aseq>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Aseq>}
	 */
	fetchPrecomputedData(aseqs, toolIds) {

	}
}
