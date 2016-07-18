'use strict'

// Core
const assert = require('assert')

// Vendor
const Promise = require('bluebird')

// Local
const arrayUtils = require('../lib/array-utils')

// Constants
const kBatchDefaults = {
	size: 25,
	insert: {
		size: 100,
		max: 1000
	},
	select: {
		size: 100,
		max: 1000
	}
}

module.exports =
class AseqsService {
	constructor(models, options = {}) {
		this.AseqModel_ = models.Aseq
		this.sequelize_ = models.Aseq.sequelize
	}

	compute(aseqs, toolIds) {
		return Promise.each(toolIds, (toolId) => {
			// eslint-disable-next-line no-mixed-requires
			let aseqsWithoutToolData = aseqs.filter((aseq) => !aseq.status[toolId]),
				// eslint-disable-next-line global-require
				featureTool = require(`./aseq-feature-tools/${toolId}`)

			return featureTool.compute(aseqsWithoutToolData)
		})
	}

	/**
	 * Searches the database for members of ${seqs} that are not present in the database. For
	 * optimization purposes, aseq ids are queried in batches of ${queryBatchSize} (vs one at a
	 * time).
	 *
	 * @param {Array.<Seq>} seqs
	 * @param {Number?} optBatchSize number of sequence ids to search against the database per
	 *   request
	 * @returns {Promise} resolves with an Array.<Seq>
	 */
	findNovelSeqs(seqs, optBatchSize = kBatchDefaults.query.size) {
		let batchSize = Math.min(optBatchSize, kBatchDefaults.query.max),
			novelSeqs = []

		return this.sequelize_.transaction(() => {
			return this.forEachChunk_(seqs, batchSize, (seqsChunk) => {
				let seqIds = seqsChunk.map((seq) => seq.seqId()),
					questionMarks = '?' + ', ?'.repeat(seqIds.length - 1),

					// Neat trick to find identifiers not already in the database: use the PG unnest
					// function to expand an array of aseq ids into a set of rows which are then left
					// outer joined against the aseqs table.
					sql = 'SELECT a.seq_id, a.row_num - 1 as row_num ' +
						`FROM unnest(array[${questionMarks}]) WITH ORDINALITY AS a(seq_id, row_num) ` +
							`LEFT OUTER JOIN ${this.AseqModel_.tableName} b ON (a.aseq_id = b.id) ` +
						'WHERE b.id is null'

				return this.sequelize_.query(sql, {
					raw: true, // Not actually returning any sequelize model instances
					replacements: seqIds
				})
				.then((results) => {
					results.forEach((result) => {
						let sourceSeq = seqsChunk[result.row_num]
						assert(sourceSeq.seqId() === result.seq_id)
						novelSeqs.push(sourceSeq)
					})
				})
			})
		})
		.then(() => novelSeqs)
	}

	/**
	 * Sequelizejs doesn't yet support PG's ability to do nothing when inserting a new record that
	 * has a conflict. This method contains adds this functionality.
	 *
	 * @param {Array.<Seq>} seqs
	 * @param {Number?} optBatchSize
	 * @returns {Promise}
	 */
	insertSeqs(seqs, optBatchSize = kBatchDefaults.insert.size) {
		let batchSize = Math.min(optBatchSize, kBatchDefaults.insert.max)
		return this.sequelize_.transaction(() => {
			return this.forEachChunk_(seqs, batchSize, (seqsChunk) => {
				let sql = `INSERT INTO ${this.AseqModel_.tableName} (length, sequence) VALUES ` +
					this.escapedSeqSqlTuple_(seqs[0])

				for (let i = 1, z = seqs.length; i < z; i++)
					sql += ', ' + this.escapedSeqSqlTuple_(seqs[i])

				sql += ' ON CONFLICT DO NOTHING'

				return this.sequelize_.query(sql, {raw: true})
			})
		})
	}

	/**
	 * Returns a unique array of ${seqs}.
	 *
	 * @param {Array.<Seq>} seqs
	 * @returns {Array.<Seq>}
	 */
	uniqueSeqs(seqs) {
		let ids = new Set()
		return seqs.filter((seq) => {
			let id = seq.seqId()
			if (ids.has(id))
				return false

			ids.add(id)
			return true
		})
	}

	// ----------------------------------------------------
	/**
	 * @param {Array} array
	 * @param {Number} chunkSize
	 * @param {Function} chunkCallbackFn
	 * @returns {Promise}
	 */
	forEachChunk_(array, chunkSize, chunkCallbackFn) {
		if (!array.length)
			return Promise.resolve()

		let effectiveQueryBatchSize = Math.min(chunkSize, kBatchDefaults.size),
			chunks = arrayUtils.chunks(array, effectiveQueryBatchSize)

		return Promise.each(chunks, chunkCallbackFn)
	}

	/**
	 * @param {Seq} seq
	 * @returns {String}
	 */
	escapedSeqSqlTuple_(seq) {
		return `(${seq.length()}, ${this.sequelize_.escape(seq.sequence())})`
	}
}
