'use strict'

// Local
const ApiError = require('./api-error'),
	HttpStatusCodes = require('../http-status-codes')

/**
 * @constructor
 *
 * @param {String} optMessage
 * @param {*} optData arbitrary relevant data
 */
module.exports =
class CriteriaError extends ApiError {
	constructor(optMessage, optData) {
		super(optMessage, optData, HttpStatusCodes.BadRequest)

		this.name = 'CriteriaError'
	}
}
