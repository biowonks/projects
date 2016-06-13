'use strict'

// Vendor
let _ = require('lodash'),
	bunyan = require('bunyan'),
	Promise = require('bluebird'),
	Sequelize = require('sequelize')

// Local
let config = require('../config'),
	loadModels = require('../models'),
	Migrator = require('./Migrator')

/**
 * Encapsulates a common configuration and all bootstrap-type methods. May be used to call
 * specific bootstrap activites (e.g. migrations) or using the setup() method, perform all
 * core responsibilities necessary to running the API.
 *
 * Because the configuration is not tied to any given instance, it is assigned as a static
 * property of the BootStrapper definition.
 */
class BootStrapper {
	/**
	 * On instantiation, creates a logger with the options specified in ${options.logger}
	 * or by default those defined in config.logger.
	 *
	 * @constructor
	 * @param {object} options defaults to an empty object
	 */
	constructor(options = {}) {
		this.logger_ = this.createLogger_(options.logger)
		this.bootStrapLogger_ = this.logger_.child({module: 'bootStrapper'})
		this.sequelize_ = null
		this.migrator_ = null
		this.models_ = null
		this.setupComplete_ = false
	}

	/**
	 * Bootstraps the API:
	 *
	 * 1) Configures sequelize
	 * 2) Loads the models
	 * 3) Checks the database connection
	 * 4) Runs any pending migrations
	 *
	 * @returns {Promise}
	 */
	setup() {
		if (this.setupComplete_)
			return Promise.resolve()

		this.bootStrapLogger_.info('Starting bootstrap process')

		try {
			this.setupSequelize()
			this.loadModels()
		}
		catch (error) {
			return Promise.reject(error)
		}

		return this.checkDatabaseConnection()
		.then(this.runPendingMigrations_.bind(this))
		.then(() => {
			this.setupComplete_ = true
		})
	}

	/**
	 * Responsible for creating the sequelize and migrator instances.
	 */
	setupSequelize() {
		let dbConfig = config.database
		if (!dbConfig)
			throw new Error('Unable to setup Sequelize: config.database is required')

		if (!dbConfig.enabled)
			return

		if (!dbConfig.name) {
			this.bootStrapLogger_.fatal('Invalid database configuration: missing database name')
			throw new Error('Database enabled, but missing configuration (name)')
		}

		if (!this.sequelize_)
			this.sequelize_ = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, dbConfig.sequelizeOptions)
		if (!this.migrator_)
			this.migrator_ = new Migrator(this.sequelize_, config.database.migrations.umzug, this.bootStrapLogger_)
	}

	/**
	 * Checks that the database may be reached by sending an authentication request. Resolves
	 * if this is successful.
	 *
	 * @returns {Promise}
	 */
	checkDatabaseConnection() {
		this.bootStrapLogger_.info('Checking database connection')
		if (!this.sequelize_)
			return Promise.reject(new Error('Sequelize not initialized. Please call setupSequelize() first'))

		return this.sequelize_.authenticate()
		.catch((error) => {
			this.bootStrapLogger_.fatal('Unable to authenticate with database: ' + error.message)
			throw error
		})
		.then(() => {
			this.bootStrapLogger_.info('Successfully connected to database')
		})
	}

	loadModels() {
		if (!this.sequelize_)
			throw new Error('Sequelize not initialized. Please call setupSequelize() first')

		if (!this.models_)
			this.models_ = loadModels(this.sequelize_, this.bootStrapLogger_)
	}

	logger() {
		return this.logger_
	}

	sequelize() {
		return this.sequelize_
	}

	models() {
		return this.models_
	}

	migrator() {
		return this.migrator_
	}

	// ----------------------------------------------------
	// Private methods
	runPendingMigrations_() {
		return this.migrator_.up()
	}

	createLogger_(options = {}) {
		let loggerOptions = _.defaults(config.logger.options, options)

		if (Reflect.has(loggerOptions, 'stream'))
			throw new Error('Stream property is not an allowed logger option. Please convert to use the streams array property. See: https://github.com/trentm/node-bunyan#streams')

		return bunyan.createLogger(loggerOptions)
	}
}

// Expose the configuration and Sequelize definition directly on the BootStrapper class as a static
// property
BootStrapper.config = config
BootStrapper.Sequelize = Sequelize

module.exports = BootStrapper
