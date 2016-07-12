// This file should be placed in the same directory as the resulting migrations

'use strict'

exports.kDefaultDelimiter = '\n-- MIGRATION DOWN SQL\n'

exports.parse = function(migrationSql, optDelimiter) {
	if (!migrationSql)
		throw new Error('Missing / empty migration SQL argument')

	if (typeof migrationSql !== 'string')
		throw new Error(`migration SQL must be string; got ${typeof migrationSql} instead`)

	let delimiter = optDelimiter || exports.kDefaultDelimiter,
		delimiterPosition = migrationSql.indexOf(delimiter),
		upSql = null,
		downSql = null

	if (delimiterPosition >= 0) {
		upSql = migrationSql.substr(0, delimiterPosition)
		downSql = migrationSql.substr(delimiterPosition)
	}
	else {
		upSql = migrationSql

		console.warn('No down SQL found in migration') // eslint-disable-line no-console
	}

	return {
		up: upSql,
		down: downSql
	}
}
