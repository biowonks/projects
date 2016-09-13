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

	/**
	 * Create the stock MiST migrator and one for the SeqDepot relations.
	 * @returns {Object}
	 */
	setupMigrator() {
		super.setupMigrator()
		this.seqdepotMigrator_ = this.createMigrator_(dbConfig.seqdepot.migrations, 'seqdepot-migrations')
		return this.migrator_
	}

	/**
	 * Loads both the MiST and SeqDepot models
	 * @returns {Object.<String,Model>}
	 */
	setupModels() {
		if (this.models_)
			return this.models_

		this.setupSequelize()
		let seqdepotModels = loadSeqdepotModels(this.sequelize_, dbConfig.seqdepot.schema, this.bootLogger_)
		this.models_ = loadMistModels(this.sequelize_, seqdepotModels, this.bootLogger_)
		return this.models_
	}

	/**
	 * Create any base schema along with the SeqDepot schema.
	 * @returns {Promise}
	 */
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
	/**
	 * Adds a couple methods to the global sequelize options.
	 */
	addGlobalClassMethods_() {
		let classMethods = this.dbConfig_.sequelizeOptions.define.classMethods
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
