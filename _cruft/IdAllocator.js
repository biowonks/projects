/**
 * This service "allocates" a block of database identifiers using a pseudo-sequence
 * managed in the database. This provides a means for assigning integral ids without
 * having to insert them into the database. By managing the id sequences in a sequence
 * database table, this may be centralized no matter how many clients are simultaneously
 * running.
 */

'use strict'

// Core includes
let assert = require('assert')

// 3rd party includes
let Sequelize = require('sequelize')

module.exports =
class IdAllocator {
	/**
	 * @param {Model} IdSequenceModel sequelize defined model
	 * @param {Object} logger the source logger
	 */
	constructor(IdSequenceModel, logger) {
		this.IdSequence_ = IdSequenceModel
		this.logger_ = logger
	}

	/**
	 * This method "reserves" or "allocates" ${amount} contiguous identifiers for
	 * the sequence named ${sequenceName} and returns a 2-element array containing
	 * the beginning identifier and the terminal identifier. It uses row-level locking
	 * to ensure that simultaneous requests for the same sequence are handled one
	 * at a time and in order.
	 *
	 * If ${sequenceName} is not found, then null is returned.
	 *
	 * @param {string} sequenceName name of sequence in database
	 * @param {number} amount number of ids to allocate
	 * @returns {Array.<number>} 2-element array denoting the range of ids that have been allocated
	 */
	reserve(sequenceName, amount) {
		assert(typeof amount === 'number' && amount > 0, 'amount must be a positive integer')

		let result = null

		return this.IdSequence_.sequelize.transaction({
			isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
		}, (t) => {
			return this.IdSequence_.findById(sequenceName, {
				transaction: t,
				lock: t.LOCK.UPDATE
			})
			.then((idSequence) => {
				if (!idSequence)
					return null

				let start = idSequence.last_value + 1,
					stop = start + amount - 1

				result = [start, stop]
				idSequence.last_value = stop
				return idSequence.save({
					fields: ['last_value'],
					transaction: t
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
	}
}
