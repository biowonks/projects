'use strict'

// Core
let fs = require('fs'),
	path = require('path')

// Local
let migrationSqlParser = require('./migration-sql-parser')

module.exports = function(sqlFileName) {
	let sqlFile = path.resolve(__dirname, 'sql', sqlFileName),
		sql = fs.readFileSync(sqlFile, 'utf-8'),
		migrationSql = migrationSqlParser.parse(sql)

	return {
		// The ${queryInterface} and ${DataTypes} arguments are passed in via the umzug
		// configuration (see db-setup.js)
		up: function(queryInterface, DataTypes) {
			return queryInterface.sequelize.query(migrationSql.up)
		},
		down: function(queryInterface, DataTypes) {
			if (!migrationSql.down)
				throw new Error(`Down migration called, but no corresponding SQL found (file: ${sqlFileName})`)

			return queryInterface.sequelize.query(migrationSql.down)
		}
	}
}
