'use strict'

// Vendor
const _ = require('lodash'),
	bunyan = require('bunyan'),
	Promise = require('bluebird'),
	Sequelize = require('sequelize')

// Vendor
const publicIp = require('public-ip'),
	Migrator = require('sequelize-migrator').Migrator

// Local
const config = require('../config'),
	loadModels = require('../models')

/**
 * Encapsulates a common configuration and all boot strapping methods. May be used to call
 * specific bootstrap activites (e.g. migrations) or, using the setup() method, perform all
 * core responsibilities necessary to running the API.
 *
 * Because the configuration is not tied to any given instance, it is assigned as a static
 * property of the BootService definition.
 */
class BootService {
	/**
	 * On instantiation, creates a logger with the options specified in ${options.logger}
	 * or by default those defined in config.logger.
	 *
	 * @constructor
	 * @param {object} options defaults to an empty object
	 */
	constructor(options = {}) {
		this.logger_ = this.createLogger_(options.logger)
		this.bootLogger_ = this.logger_.child({module: 'bootService'})
		this.sequelize_ = null
		this.migrator_ = null
		this.models_ = null
		this.setupComplete_ = false
		this.publicIP_ = null
	}

	/**
	 * Bootstraps the API:
	 *
	 * 1) Configures sequelize
	 * 2) Loads the models
	 * 3) Checks the database connection
	 * 4) Sets up any defined schema
	 * 5) Runs any pending migrations
	 *
	 * @returns {Promise}
	 */
	setup() {
		if (this.setupComplete_)
			return Promise.resolve()

		this.bootLogger_.info('Starting the bootstrap process')

		try {
			this.setupSequelize()
			this.loadModels()
		}
		catch (error) {
			return Promise.reject(error)
		}

		return this.checkDatabaseConnection()
		.then(this.setupDatabase.bind(this))
		.then(this.runPendingMigrations_.bind(this))
		.catch(this.sequelize_.DatabaseError, (databaseError) => {
			this.bootLogger_.fatal({sql: databaseError.sql}, databaseError.message)
			throw databaseError
		})
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
			this.bootLogger_.fatal('Invalid database configuration: missing database name')
			throw new Error('Database enabled, but missing configuration (name)')
		}

		if (!this.sequelize_)
			this.sequelize_ = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, dbConfig.sequelizeOptions)

		if (!this.migrator_) {
			let options = {
				path: dbConfig.migrations.path,
				pattern: dbConfig.migrations.pattern,
				modelName: dbConfig.migrations.modelName,
				tableName: dbConfig.migrations.tableName,
				schema: dbConfig.migrations.schema,
				logger: this.logger_.child({module: 'migrations'})
			}
			this.migrator_ = new Migrator(this.sequelize_, options)
		}
	}

	loadModels() {
		if (!this.sequelize_)
			throw new Error('Sequelize not initialized. Please call setupSequelize() first')

		if (!this.models_)
			this.models_ = loadModels(this.sequelize_, this.bootLogger_)
	}

	/**
	 * Checks that the database may be reached by sending an authentication request. Resolves
	 * if this is successful.
	 *
	 * @returns {Promise}
	 */
	checkDatabaseConnection() {
		this.bootLogger_.info('Checking database connection')
		if (!this.sequelize_)
			return Promise.reject(new Error('Sequelize not initialized. Please call setupSequelize() first'))

		return this.sequelize_.authenticate()
		.catch((error) => {
			this.bootLogger_.fatal('Unable to authenticate with database: ' + error.message)
			throw error
		})
		.then(() => {
			this.bootLogger_.info('Successfully connected to database')
		})
	}

	setupDatabase() {
		return this.setupSchema_()
		.then(this.setupSearchPath_.bind(this))
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

	publicIP() {
		if (this.publicIP_)
			return Promise.resolve(this.publicIP_)

		return publicIp.v4()
		.then((ip) => {
			this.publicIP_ = ip
			return ip
		})
	}

	// ----------------------------------------------------
	// Private methods
	createLogger_(options = {}) {
		let loggerOptions = _.defaults(config.logger.options, options)

		if (Reflect.has(loggerOptions, 'stream'))
			throw new Error('Stream property is not an allowed logger option. Please convert to use the streams array property. See: https://github.com/trentm/node-bunyan#streams')

		return bunyan.createLogger(loggerOptions)
	}

	setupSchema_() {
		let schema = null
		try {
			schema = config.database.sequelizeOptions.define.schema
		}
		catch (error) {
			// Noop
		}
		if (!schema)
			return Promise.resolve()

		let validSchemaName = /^[A-Za-z][\w_]*$/.test(schema)
		if (!validSchemaName)
			throw new Error('Schema name begin with a letter and consist only of alphanumeric characters or underscores')

		this.bootLogger_.info({schema}, `Creating schema, ${schema}, if it does not already exist`)

		return this.sequelize_.query(`create schema if not exists ${schema}`, {raw: true})
	}

	setupSearchPath_() {
		let searchPath = config.database.searchPath
		if (!searchPath)
			return Promise.resolve()

		this.bootLogger_.info({searchPath}, `Setting search_path to ${searchPath}`)
		return this.sequelize_.query(`set search_path to ${searchPath}`, {raw: true})
	}

	runPendingMigrations_() {
		return this.migrator_.up()
	}
}

// Expose the configuration and Sequelize definition directly on the BootService class as a static
// property
BootService.config = config
BootService.Sequelize = Sequelize

module.exports = BootService
