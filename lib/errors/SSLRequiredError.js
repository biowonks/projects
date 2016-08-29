'use strict'

// Local
const ApiError = require('./ApiError'),
	HttpStatusCodes = require('../http-status-codes')

module.exports =
class SSLRequiredError extends ApiError {
	constructor() {
		super('HTTPS is required; HTTP is not supported', null, HttpStatusCodes.Forbidden)
		this.name = 'SSLRequiredError'
	}
}
