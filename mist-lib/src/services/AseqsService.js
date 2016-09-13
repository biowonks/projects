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
