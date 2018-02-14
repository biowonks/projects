'use strict'

// Local
const HttpStatusCodes = require('./http-status-codes')
const NotFoundError = require('./errors/NotFoundError')

// Constants
const kIsProduction = process.env.NODE_ENV === 'production'

/*
 * Sequelize error hierarchy (see lib/errors.js)
 *
 * BaseError
 *   - message
 *   - name
 *   ValidationError
 *     - errors
 *     UniqueConstraintError
 *       - parent
 *   - errors
 *   - fields
 *   DatabaseError
 *     - parent
 *     - original
 *     - sql
 *     ForeignKeyConstraintError
 *       - fields
 *       - table
 *       - value
 *       - index
 *     ExclusionConstraintError
 *       - constraint
 *       - fields
 *       - table
 *   TimeoutError
 *   ConnectionError
 *     - parent
 *     - original
 *     ConnectionRefusedError
 *     AccessDeniedError
 *     HostNotFoundError
 *     HostNotReachableError
 *     InvalidConnectionError
 *     ConnectionTimedOutError
 */
module.exports = function(app) {
	const config = app.get('config')
	const logger = app.get('logger')
	const sequelize = app.get('sequelize')

	const errorHandler = (error, req, res, next) => {
		// Translate missing files into NotFoundErrors. For example, this may occur
		// when a static handler does not map to an actual file on the filesystem.
		if (error.code === 'ENOENT') {
			error = new NotFoundError()
		}

		const result = {
			name: error.name,
			code: error.code || HttpStatusCodes.InternalServerError,
			message: error.message || 'Unspecified error'
		}

		if (error.data)
			result.data = error.data

		if (error.errors) {
			result.errors = error.errors

			// Clean up the errors a tad
			result.errors.forEach((subError) => {
				Reflect.deleteProperty(subError, '__raw')
				Reflect.deleteProperty(subError, 'value')
			})
		}

		if (error instanceof sequelize.UniqueConstraintError) {
			result.message = 'Unique constraint error'
			result.debug = {
				fields: error.fields
			}
		}
		else if (error instanceof sequelize.ValidationError) {
			result.code = HttpStatusCodes.BadRequest
		}
		else if (error instanceof sequelize.ForeignKeyConstraintError) {
			result.message = 'Foreign key constraint error'
			result.debug = {
				fields: error.fields,
				table: error.table,
				value: error.value,
				index: error.index,
				sql: error.sql
			}
		}
		else if (error instanceof sequelize.ExclusionConstraintError) {
			result.message = 'Exclusion constraint error'
			result.debug = {
				constraint: error.constraint,
				fields: error.fields,
				table: error.table,
				sql: error.sql
			}
		}
		else if (error instanceof sequelize.DatabaseError) {
			result.message = 'Database error'
			result.debug = {
				sql: error.sql,
				message: error.message
			}
		}
		else if (error instanceof sequelize.TimeoutError) {
			result.message = 'Timeout error'
		}
		else if (error instanceof sequelize.ConnectionRefusedError) {
			result.message = 'Connection refused'
		}
		else if (error instanceof sequelize.AccessDeniedError) {
			result.message = 'Access denied'
		}
		else if (error instanceof sequelize.HostNotFoundError) {
			result.message = 'Host not found'
		}
		else if (error instanceof sequelize.HostNotReachableError) {
			result.message = 'Host not reachable'
		}
		else if (error instanceof sequelize.InvalidConnectionError) {
			result.message = 'Invalid connection'
		}
		else if (error instanceof sequelize.ConnectionTimedOutError) {
			result.message = 'Connection timeout error'
		}
		else if (error instanceof sequelize.ConnectionError) {
			result.message = 'Connection error'
		}

		if (logger)
			logger.error(result, result.message)

		if (config.debug.errors)
			console.error(error, error.stack)	// eslint-disable-line no-console

		if (kIsProduction)
			Reflect.deleteProperty(result, 'debug')

		res.status(result.code).json(result)
	}

	return errorHandler
}
