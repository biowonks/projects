'use strict'

// Vendor
const bunyan = require('bunyan'),
	Promise = require('bluebird')

// Vendor
const publicIp = require('public-ip'),
	Migrator = require('sequelize-migrator').Migrator,
	modelLoader = require('sequelize-model-loader'),
	Sequelize = require('sequelize')

// Local
const normalizeConfig = require('../db/normalize-config')

/**
 * Encapsulates common logic necessary to boot a database-enabled application leveraging the
 * sequelizejs library from a database configuration.
 *
 * Call setup() to perform all relevant functions to booting (e.g. setting up sequelize, checking
 * the database connection, running migrations, etc.). Alternatively, these functions may be
 * accomplished by calling the individual functions as desired.
 *
 * Subclass this service to provide specialized boot logic (e.g. run seqdepot migrations in the
 * same migration database).
 */
class BootService {
	/**
	 * On instantiation, creates a logger with the options specified in ${options.logger}.
	 *
	 * @constructor
	 * @param {Object} dbConfig
	 * @param {Object} [options = {}]
	 * @param {Object} [options.logger] - bunyan logger options
	 */
	constructor(dbConfig, options = {}) {
		if (!dbConfig)
			throw new Error('missing database configuration')

		this.dbConfig_ = normalizeConfig(dbConfig)
		this.logger_ = this.createLogger_(options.logger)
		this.bootLogger_ = this.logger_.child({module: 'BootService'})

		this.sequelize_ = null
		this.migrator_ = null
		this.models_ = null
		this.setupComplete_ = false
		this.publicIP_ = null
	}

	/**
	 * 1) Configures sequelize
	 * 2) Creates the migrator
	 * 3) Loads the models
	 * 4) Checks the database connection
	 * 5) Sets up any defined schema
	 * 6) Runs any pending migrations
	 *
	 * @returns {Promise}
	 */
	setup() {
		if (this.setupComplete_)
			return Promise.resolve()

		this.bootLogger_.info('Starting the bootstrap process')

		try {
			this.setupSequelize()
			this.setupMigrator()
			this.setupModels()
		}
		catch (error) {
			return Promise.reject(error)
		}

		return this.checkDatabaseConnection()
		.then(this.setupSchema.bind(this))
		.then(this.runPendingMigrations.bind(this))
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
	 * @returns {Object} - sequelize instance
	 */
	setupSequelize() {
		if (this.sequelize_)
			return this.sequelize_

		let dbConfig = this.dbConfig_
		if (!dbConfig.name) {
			this.bootLogger_.fatal('Invalid database configuration: missing database name')
			throw new Error('database configuration missing \'name\'')
		}

		if (!this.sequelize_)
			this.sequelize_ = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, dbConfig.sequelizeOptions)

		return this.sequelize_
	}

	setupMigrator() {
		this.migrator_ = this.createMigrator_(this.dbConfig_.migrations, 'migrations')
		return this.migrator_
	}

	/**
	 * @param {*} [context = null] - optional parameter to send to each model when required.
	 * @returns {Object.<String,Model>}
	 */
	setupModels(context = null) {
		if (this.models_)
			return this.models_

		this.setupSequelize()
		this.models_ = modelLoader(this.dbConfig_.models.path, this.sequelize_, {
			logger: this.bootLogger_,
			schema: this.dbConfig_.schema,
			context
		})

		return this.models_
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

	setupSchema() {
		return this.createSchema_(this.dbConfig_.schema)
	}

	runPendingMigrations() {
		return this.migrator_.up()
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
	// Protected methods
	createMigrator_(migratorOptions, loggerName) {
		let options = {
			path: migratorOptions.path,
			pattern: migratorOptions.pattern,
			modelName: migratorOptions.modelName,
			tableName: migratorOptions.tableName,
			schema: migratorOptions.schema,
			logger: this.logger_.child({module: loggerName})
		}

		return new Migrator(this.sequelize_, options)
	}

	/**
	 * @param {String} [schema = null]
	 * @returns {Promise}
	 */
	createSchema_(schema = null) {
		if (!schema)
			return Promise.resolve()

		let validSchemaName = /^[A-Za-z][\w_]*$/.test(schema)
		if (!validSchemaName)
			throw new Error('Schema name begin with a letter and consist only of alphanumeric characters or underscores')

		this.bootLogger_.info({schema}, `Creating schema, ${schema}, if it does not already exist`)

		return this.sequelize_.query(`create schema if not exists ${schema}`, {raw: true})
	}

	setSearchPath_(searchPath) {
		if (!searchPath)
			return Promise.resolve()

		this.bootLogger_.info({searchPath}, `Setting search_path to ${searchPath}`)
		return this.sequelize_.query(`set search_path to ${searchPath}`, {raw: true})
	}

	// ----------------------------------------------------
	// Private methods
	createLogger_(loggerOptions = {name: 'unknown'}) {
		if (Reflect.has(loggerOptions, 'stream'))
			throw new Error('Stream property is not an allowed logger option. Please convert to use the streams array property. See: https://github.com/trentm/node-bunyan#streams')

		return bunyan.createLogger(loggerOptions)
	}
}

// Expose the configuration and Sequelize definition directly on the BootService class as a static
// property
BootService.Sequelize = Sequelize

module.exports = BootService
