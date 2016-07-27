/* eslint-disable valid-jsdoc */

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const Promise = require('bluebird')

// Local
const AbstractSeqsService = require('../AbstractSeqsService')

// Other
const kToolRunners = discoverToolRunners(),
	kValidToolIdSet = new Set(kToolRunners.map((x) => x.id))

module.exports =
class AseqsService extends AbstractSeqsService {
	static tools() {
		return kToolRunners
	}

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

	/**
	 * @param {Array.<Aseq>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Aseq>} - aseqs decorated with the computed results
	 */
	compute(aseqs, toolIds) {
		let invalidToolId = this.firstInvalidToolId(toolIds)
		if (invalidToolId)
			return Promise.reject(new Error(`invalid tool id: ${invalidToolId}`))

		return Promise.each(toolIds, (toolId) => {
			// eslint-disable-next-line global-require, no-mixed-requires
			let toolRunner = require(`./tool-runners/${toolId}.tool-runner`),
				toolRunnerConfig = this.config_.pipeline.toolRunners[toolId]
			return toolRunner(aseqs, toolRunnerConfig)
		})
		.then(() => aseqs)
	}

	/**
	 * Updates the values of ${toolIds} of each ${aseqs} if they are null. Non-tool id fields are
	 * ignored and existing database values takes precedence over any of the direct Aseq values.
	 *
	 * @param {Array.<Aseq>} aseqs
	 * @param {Array.<String>} toolIds
	 * @param {Transaction} [transaction=null]
	 * @returns {Array.<Aseq>}
	 */
	saveToolData(aseqs, toolIds, transaction = null) {
		if (!toolIds.length)
			return Promise.resolve(aseqs)

		let setSql = toolIds.map((toolId) => `${toolId} = coalesce(${toolId}, ?)`).join(', '),
			nullClause = toolIds.map((toolId) => `${toolId} IS NULL`).join(' OR '),
			replacements = [],
			nToolIds = toolIds.length,
			sql = `
UPDATE ${this.model_.getTableName()}
SET ${setSql}
WHERE id = ? AND (${nullClause})`

		return Promise.each(aseqs, (aseq) => {
			for (let i = 0; i < nToolIds; i++)
				replacements[i] = JSON.stringify(aseq[toolIds[i]])
			replacements[nToolIds] = aseq.id

			return this.sequelize_.query(sql, {
				replacements,
				plain: true,
				type: this.sequelize_.QueryTypes.UPDATE,
				transaction
			})
		})
	}

	/**
	 * Splits ${aseqs} into groups based on which ${toolIds} have not been
	 * @param {Array.<Aseq>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Object>}
	 */
	groupByUndoneTools(aseqs, toolIds) {
		let map = new Map()
		for (let i = 0, z = aseqs.length; i < z; i++) {
			let aseq = aseqs[i],
				undoneToolIds = []
			toolIds.forEach((toolId) => {
				if (!aseq[toolId])
					undoneToolIds.push(toolId)
			})
			let key = undoneToolIds.join('|')
			if (map.has(key))
				map.get(key).push(aseq)
			else
				map.set(key, [aseq])
		}

		let groups = []
		for (let key of map.keys()) {
			groups.push({
				aseqs: map.get(key),
				toolIds: key.length ? key.split('|') : []
			})
		}
		return groups
	}

	firstInvalidToolId(toolIds) {
		for (let toolId of toolIds) {
			if (!this.isValidToolId(toolId))
				return toolId
		}

		return null
	}

	isValidToolId(toolId) {
		return kValidToolIdSet.has(toolId)
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
