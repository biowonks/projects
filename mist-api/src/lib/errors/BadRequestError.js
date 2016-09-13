'use strict'

// Local
const ApiError = require('./ApiError'),
	HttpStatusCodes = require('../http-status-codes')

class BadRequestError extends ApiError {
	constructor(message = null, data = null) {
		super(message, data, HttpStatusCodes.BadRequest)
		this.name = BadRequestError
	}

	addValidationError(path, message) {
		if (!this.errors)
			this.errors = []

		this.errors.push({
			path,
			message,
			type: 'ValidationError'
		})
	}

	static validationError(optType, optPath, optMessage) {
		let error = new BadRequestError('Validation error')
		if (optType || optPath || optMessage) {
			let detail = {}
			if (optType)
				detail.type = optType
			if (optPath)
				detail.path = optPath
			if (optMessage)
				detail.message = optMessage
			error.errors = [detail]
		}
		return error
	}

	static foreignKeyError(targetEntity, optPath, optMessage) {
		let type = 'foreignKey violation',
			message = optMessage || ('Referenced ' + targetEntity + ' does not exist'),
			path = optPath || (targetEntity + '_id')
		return BadRequestError.validationError(type, path, message)
	}
}

module.exports = BadRequestError
