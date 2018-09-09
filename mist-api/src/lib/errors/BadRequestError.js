'use strict'

// Local
const ApiError = require('./ApiError')
const HttpStatusCodes = require('../http-status-codes')

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
		const error = new BadRequestError('Validation error')
		if (optType || optPath || optMessage) {
			const detail = {}
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
		const type = 'foreignKey violation'
		const message = optMessage || ('Referenced ' + targetEntity + ' does not exist')
		const path = optPath || (targetEntity + '_id')
		return BadRequestError.validationError(type, path, message)
	}
}

module.exports = BadRequestError
