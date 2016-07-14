/* eslint-disable valid-jsdoc */

'use strict'

// Local
const AbstractSeqsService = require('./AbstractSeqsService')

// Constants


module.exports =
class AseqsService extends AbstractSeqsService {
	insertIgnoreSeqs(seqs, transaction) {
		return super.insertIgnoreSeqs(seqs, ['id', 'length', 'sequence'], transaction)
	}

	/**
	 * Fetches toolIds data from the database and merges it into ${aseqs}. If an Aseq and the
	 * database record both contain non-null data, the database value takes precedence.
	 *
	 * @param {Array.<Model>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Model>}
	 */
	fetchPrecomputedData(aseqs, toolIds) {

	}

	/**
	 * @param {Array.<Model>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Model>}
	 */
	compute(aseqs, toolIds) {
		if (!toolIds.length)
			return Promise.resolve(aseqs)

		return null
	}

	/**
	 * @param {Array.<Model>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Model>}
	 */
	upsert(aseqs, toolIds) {

	}

	/**
	 * Splits ${aseqs} into groups based on which ${toolIds} have not been
	 * @param {Array.<Model>} aseqs
	 * @param {Array.<String>} toolIds
	 */
	groupByUndoneTools(aseqs, toolIds) {

	}
}
