'use strict'

exports.ApiError = require('./ApiError')
exports.CriteriaError = require('./CriteriaError')

exports.NotFoundError = require('./NotFoundError')
exports.notFoundError = new exports.NotFoundError()

exports.UnauthorizedError = require('./UnauthorizedError')
exports.unauthorizedError = new exports.UnauthorizedError()

exports.SSLRequiredError = require('./SSLRequiredError')
exports.sslRequiredError = new exports.SSLRequiredError()

exports.BadRequestError = require('./BadRequestError')
exports.badRequestError = new exports.BadRequestError()
exports.missingJsonHeaderError = new exports.BadRequestError('Invalid Content-Type header; missing application/json')
exports.emptyBodyError = new exports.BadRequestError('message body cannot be empty')
