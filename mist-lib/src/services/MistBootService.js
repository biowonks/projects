'use strict'

// Core
const assert = require('assert')

// Local
const BootService = require('core-lib/services/BootService'),
	loadSeqdepotModels = require('seqdepot-lib/models'),
	loadMistModels = require('../models'),
	dbConfig = require('../db/config')

module.exports =
class MistBootService extends BootService {
	/**
	 * @param {Object} [options = {}]
	 * @param {String} [options.applicationName]
	 * @param {Object} [options.logger] - bunyan compatible logger instance
	 */
	constructor(options = {}) {
		dbConfig.applicationName = options.applicationName
		super(dbConfig, options)
		this.seqdepotMigrator_ = null

		this.addGlobalClassMethods_()
	}

	setupMigrator() {
		super.superMigrator()
		this.seqdepotMigrator_ = this.createMigrator_(dbConfig.seqdepot.migrations, 'seqdepot-migrations')
		return this.migrator_
	}

	/**
	 * Loads both the MiST and SeqDepot models
	 * @returns {Object.<String,Model>}
	 */
	setupModels() {
		this.models_ = loadMistModels(this.sequelize_, this.bootLogger_)
		let seqdepotModels = loadSeqdepotModels(this.sequelize_, this.bootLogger_)
		for (let name in seqdepotModels) {
			let isConflictingName = Reflect.has(this.models_, name)
			if (isConflictingName)
				throw new Error(`model name conflict: ${name} exists in both MiST and seqdepot`)
			this.models_[name] = seqdepotModels[name]
		}

		return this.models_
	}

	setupSchema() {
		return super.setupSchema()
		.then(this.createSchema_.bind(this, dbConfig.seqdepot.schema))
	}

	/**
	 * Run the seqdepot migrations *before* any of the MiST migrations
	 * @returns {Promise}
	 */
	runPendingMigrations() {
		return this.seqdepotMigrator_.up()
		.then(super.runPendingMigrations.bind(this))
	}

	// ----------------------------------------------------
	// Private methods
	addGlobalClassMethods_() {
		let classMethods = this.dbConfig_.sequelizeOptions.define
		assert(typeof classMethods === 'object')

		/**
		 * @returns {Set} - those attributes which are excluded from selection via the CriteriaService
		 */
		classMethods.$excludedFromCriteria = function() {
			return null
		}

		/**
		 * @returns {Array.<String>} - attributes that may be selected via the CriteriaService; if null, indicates all attributes may be selected
		 */
		classMethods.$criteriaAttributes = function() {
			return null
		}
	}
}
