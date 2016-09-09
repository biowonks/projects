'use strict'

// Local
const BootService = require('core-lib/services/BootService'),
	dbConfig = require('../db/config'),
	mistSequelizeFn = require('../mist-sequelize')

module.exports =
class MistBootService extends BootService {
	/**
	 * @param {Object} [options = {}]
	 * @param {String} [options.applicationName]
	 * @param {Object} [options.logger] - bunyan compatible logger instance
	 */
	constructor(options = {}) {
		dbConfig.applicationName = options.applicationName
		super(mistSequelizeFn, dbConfig, options)
		this.seqdepotMigrator_ = null
	}

	/**
	 * Additionally create a seqdepot migrator object
	 */
	setupMigrator_() {
		this.seqdepotMigrator_ = this.createMigrator_(dbConfig.seqdepot.migrations, 'seqdepot-migrations')
		super.setupMigrator_()
	}

	setupSchema_() {
		return this.createSchema_(dbConfig.seqdepot.schema)
		.then(super.setupSchema_.bind(this))
	}

	/**
	 * Run the seqdepot migrations *before* any of the MiST migrations
	 * @returns {Promise}
	 */
	runPendingMigrations_() {
		return this.setSearchPath_(dbConfig.seqdepot.schema)
		.then(() => this.seqdepotMigrator_.up(this))
		.then(this.setSearchPath_.bind(this, dbConfig.schema))
		.then(super.runPendingMigrations_.bind(this))
	}
}
