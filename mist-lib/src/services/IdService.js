'use strict'

// Core
const assert = require('assert')

class SequenceNotFoundError extends Error {}

module.exports =
class IdService {
	/**
	 * @constructor
	 * @param {Model} idSequenceModel - Sequelize model
	 * @param {Object} logger - bunyan compatible logger
	 */
	constructor(idSequenceModel, logger) {
		this.idSequenceModel_ = idSequenceModel
		this.logger_ = logger
	}

	/**
	 * "reserves" or "allocates" ${amount} contiguous identifiers for the sequence named
	 * ${sequenceName} and returns a 2-element array containing the beginning identifier and the
	 * terminal identifier. It uses row-level locking to ensure that simultaneous requests for
	 * the same sequence are handled serially and in order.
	 *
	 * ${sequenceName} is created if not found.
	 *
	 * @param {string} sequenceName name of sequence in database
	 * @param {number} amount number of ids to allocate
	 * @returns {Array.<number>} 2-element array denoting the range of ids that have been allocated
	 */
	reserve(sequenceName, amount) {
		assert(typeof amount === 'number' && amount > 0, 'amount must be a positive integer')

		let result = null
		return this.idSequenceModel_.sequelize.transaction({
			isolationLevel: 'READ COMMITTED'
		}, (transaction) => {
			return this.idSequenceModel_.find({
				where: {
					name: sequenceName
				},
				transaction,
				lock: transaction.LOCK.UPDATE
			})
			.then((idSequence) => {
				if (!idSequence)
					throw new SequenceNotFoundError()

				let start = idSequence.last_value + 1,
					stop = start + amount - 1

				result = [start, stop]
				idSequence.last_value = stop
				return idSequence.save({
					fields: ['last_value'],
					transaction
				})
			})
			.then(() => {
				this.logger_.info({
					sequenceName,
					start: result[0],
					stop: result[1]
				}, `Reserved ${result[1] - result[0] + 1} identifiers for the sequence named '${sequenceName}'`)
				return result
			})
		})
		.catch(SequenceNotFoundError, () => {
			return this.createDoNothingOnConflict_(sequenceName)
			.then(() => this.reserve(sequenceName, amount))
		})
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * @param {String} sequenceName}
	 * @returns {Promise}
	 */
	createDoNothingOnConflict_(sequenceName) {
		let sql = `INSERT INTO ${this.idSequenceModel_.getTableName()} (name) VALUES (?) ON CONFLICT DO NOTHING`
		return this.idSequenceModel_.sequelize.query(sql, {
			replacements: [sequenceName],
			type: this.idSequenceModel_.sequelize.QueryTypes.INSERT,
			raw: true
		})
		.then(() => {
			this.logger_.info(`created a new id sequence ${sequenceName}`)
		})
	}
}
