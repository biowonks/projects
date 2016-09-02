'use strict'

// Local
const ApiError = require('./ApiError'),
	HttpStatusCodes = require('../http-status-codes')

module.exports =
class UnauthorizedError extends ApiError {
	constructor() {
		super('Unauthorized', null, HttpStatusCodes.NotFound)
		this.name = 'UnauthorizedError'
	}
}
