'use strict'

// Local
const ApiError = require('./api-error'),
	HttpStatusCodes = require('../http-status-codes')

class RestError extends ApiError {
	static validationError(optType, optPath, optMessage) {
		let error = new RestError(HttpStatusCodes.BadRequest, 'Validation error')
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
		return RestError.validationError(type, path, message)
	}

	constructor(code, optMessage, optData) {
		super(optMessage, optData, code)
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
}

// Standard REST errors
RestError.error400 = new RestError(HttpStatusCodes.BadRequest, 'Bad Request')
RestError.error401 = new RestError(HttpStatusCodes.Unauthorized, 'Unauthorized')
RestError.error403 = new RestError(HttpStatusCodes.Forbidden, 'Forbidden')
RestError.error404 = new RestError(HttpStatusCodes.NotFound, 'Not found')

// Custom REST errors
RestError.missingJsonHeader = new RestError(HttpStatusCodes.BadRequest, 'Invalid Content-Type header: application/json required')
RestError.emptyBody = new RestError(HttpStatusCodes.BadRequest, 'Message body cannot be empty')
