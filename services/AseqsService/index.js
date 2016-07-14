/* eslint-disable valid-jsdoc */

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Local
const AbstractSeqsService = require('../AbstractSeqsService')

// Other
const kToolRunners = discoverToolRunners()

module.exports =
class AseqsService extends AbstractSeqsService {
	static tools() {
		return kToolRunners
	}

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

/**
 * @returns {Array.<Object>} - array of supported AseqsService tools (as determined by querying the tool-runners subdirectory). Each object contains each tool-runner's meta data and an id field which is the basename of the tool-runner.
 */
function discoverToolRunners() {
	let basePath = 'tool-runners',
		toolRunnersDir = path.join(__dirname, basePath),
		suffix = '.tool-runner.js'

	return fs.readdirSync(toolRunnersDir)
	.filter((fileName) => {
		let file = path.join(toolRunnersDir, fileName),
			stat = fs.statSync(file)

		return stat.isFile() && fileName.endsWith(suffix)
	})
	.map((fileName) => {
		// eslint-disable-next-line global-require, no-mixed-requires
		let runner = require(`./${basePath}/${fileName}`),
			meta = runner.meta || {}

		meta.id = path.basename(fileName, suffix)

		return meta
	})
}
