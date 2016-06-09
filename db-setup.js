'use strict'

// Vendor
// let Umzug = require('umzug'),
let Promise = require('bluebird'),
	Sequelize = require('sequelize')

// Local
let Migrator = require('./services/Migrator')

module.exports = function(config, logger) {
	if (!config)
		return Promise.reject('Unable to setup database: missing configuration')

	if (!logger)
		return Promise.reject('Unable to setup database: missing logger')

	let dbConfig = config.database
	if (!dbConfig)
		return Promise.reject('Unable to setup database: config.database is not valid')

	if (!dbConfig.enabled)
		return Promise.resolve()

	logger.info('Validating database connection')

	if (!dbConfig.name) {
		logger.fatal('Invalid database configuration: missing database name')
		return Promise.reject(new Error('Database enabled, but missing configuration (name)'))
	}

	let sequelize = null

	try {
		sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, dbConfig.sequelizeOptions)
	}
	catch (error) {
		return Promise.reject(error)
	}

	return sequelize.authenticate()
	.catch((error) => {
		logger.fatal('Unable to authenticate with database: ' + error.message)
		throw error
	})
	.then(() => {
		logger.info('Successfully connected to database')

		let migrator = new Migrator(sequelize, config.database.migrations.umzug, logger)
		return migrator.up()
	})
	.then(() => {
		return sequelize
	})
}
