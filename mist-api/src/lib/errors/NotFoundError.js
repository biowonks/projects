'use strict'

// Local
const ApiError = require('./ApiError')
const HttpStatusCodes = require('../http-status-codes')

module.exports =
class NotFoundError extends ApiError {
	constructor() {
		super('Not found', null, HttpStatusCodes.NotFound)
		this.name = 'NotFoundError'
	}
}
