'use strict'

// Constants
const kPostgresPort = 5432

/**
 * @param {Object} dbConfig
 * @param {String} [dbConfig.schema = null] - schema to use when running migrations and for each model unless otherwise specified
 * @param {String} [dbConfig.applicationName = null] - name used by sequelize database driver
 * @param {String} [dbConfig.dialect = 'postgres']
 * @param {String} [dbConfig.user] - database connection user name
 * @param {String} [dbConfig.password] - database connection password
 * @param {String} [dbConfig.host = 'localhost'] - database host
 * @param {Number} [dbConfig.port = 5432]
 * @param {String} [dbConfig.name] - database name
 * @param {Boolean} [dbConfig.ssl = false] - use ssl to connect to database
 * @param {Boolean|Function} [dbConfig.logging = false] - option to log sequelizejs methods
 * @param {Boolean} [dbConfig.underscoredTableNames = true] - whether tablenames are underscored
 * @param {Boolean} [dbConfig.timestamps = true] - each table by default has timestamps
 * @param {Object} [dbConfig.sequelizeOptions] - these are passed directly to the sequelize constructor; some of the other dbConfig options correspond to these object fields in which case if both are defined, the other dbConfig options take precedence
 * @param {Object} dbConfig.models
 * @param {String} dbConfig.models.path - directory containing sequelizejs models
 * @param {Object} dbConfig.migrations
 * @param {String} dbConfig.migrations.path - directory containing SQL migration files
 * @param {RegExp} [dbConfig.migrations.pattern] - only process migration files that match this pattern
 * @returns {Object}
 */
module.exports = function(dbConfig) {
	if (dbConfig.migrations) {
		if (!dbConfig.migrations.schema)
			dbConfig.migrations.schema = dbConfig.schema
	}

	if (!dbConfig.sequelizeOptions)
		dbConfig.sequelizeOptions = {}

	let sequelizeOptions = dbConfig.sequelizeOptions
	if (!sequelizeOptions.define)
		sequelizeOptions.define = {}
	if (!sequelizeOptions.dialectOptions)
		sequelizeOptions.dialectOptions = {}

	// Enforce underscored table names and timestamps by default
	sequelizeOptions.define.underscored = Reflect.has(dbConfig, 'underscoredTableNames') ? !!dbConfig.underscoredTableNames : true
	sequelizeOptions.define.timestamps = Reflect.has(dbConfig, 'timestamps') ? !!dbConfig.timestamps : true

	sequelizeOptions.define.schema = dbConfig.schema
	sequelizeOptions.dialect = dbConfig.dialect || 'postgres'
	sequelizeOptions.dialectOptions.application_name = dbConfig.applicationName
	sequelizeOptions.host = dbConfig.host || 'localhost'
	sequelizeOptions.port = dbConfig.port || kPostgresPort
	sequelizeOptions.dialectOptions.ssl = dbConfig.ssl
	sequelizeOptions.logging = dbConfig.logging

	return dbConfig
}
