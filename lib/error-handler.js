'use strict';

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

var Sequelize = require('sequelize');

module.exports = function(app) {
	var config = app.get('config'),
		logger = app.get('logger');

	var errorHandler = function(error, req, res, next) {
		var result = {
			code: error.code || 500,
			message: error.message || 'Unspecified error'
		};

		if (error.data)
			result.data = error.data;

		if (error.errors) {
			result.errors = error.errors;

			// Clean up the errors a tad
			result.errors.forEach(function(subError) {
				delete subError.__raw;
				delete subError.value;
			});
		}

		if (error instanceof Sequelize.UniqueConstraintError) {
			result.message = 'Unique constraint error';
			result.data = {
				fields: error.fields
			};
		}
		else if (error instanceof Sequelize.ValidationError) {
			result.code = 400;
		}
		else if (error instanceof Sequelize.ForeignKeyConstraintError) {
			result.message = 'Foreign key constraint error';
			result.data = {
				fields: error.fields,
				table: error.table,
				value: error.value,
				index: error.index,
				sql: error.sql
			};
		}
		else if (error instanceof Sequelize.ExclusionConstraintError) {
			result.message = 'Exclusion constraint error';
			result.data = {
				constraint: error.constraint,
				fields: error.fields,
				table: error.table,
				sql: error.sql
			};
		}
		else if (error instanceof Sequelize.DatabaseError) {
			result.message = 'Database error';
			result.data = {
				sql: error.sql,
				message: error.message
			};
		}
		else if (error instanceof Sequelize.TimeoutError) {
			result.message = 'Timeout error';
		}
		else if (error instanceof Sequelize.ConnectionRefusedError) {
			result.message = 'Connection refused';
		}
		else if (error instanceof Sequelize.AccessDeniedError) {
			result.message = 'Access denied';
		}
		else if (error instanceof Sequelize.HostNotFoundError) {
			result.message = 'Host not found';
		}
		else if (error instanceof Sequelize.HostNotReachableError) {
			result.message = 'Host not reachable';
		}
		else if (error instanceof Sequelize.InvalidConnectionError) {
			result.message = 'Invalid connection';
		}
		else if (error instanceof Sequelize.ConnectionTimedOutError) {
			result.message = 'Connection timeout error';
		}
		else if (error instanceof Sequelize.ConnectionError) {
			result.message = 'Connection error';
		}

		if (logger)
			logger.error(result, result.message);

		if (config.debug.errors)
			console.error(error, error.stack);	// eslint-disable-line no-console

		// If there is a transaction still in play, roll it back :)
		if (res.locals.transaction)
			res.locals.transaction.rollback();

		res.status(result.code).json(result);
	};

	return errorHandler;
};
