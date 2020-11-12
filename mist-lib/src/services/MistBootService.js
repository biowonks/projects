'use strict';

// Local
const BootService = require('core-lib/services/BootService');
const loadSeqdepotModels = require('seqdepot-lib/models');
const loadMistModels = require('../models');
const dbConfig = require('../db/config');

module.exports =
class MistBootService extends BootService {
  /**
	 * @param {Object} [options = {}]
	 * @param {String} [options.applicationName]
	 * @param {Object} [options.logger] - bunyan compatible logger instance
	 * @param {number} [options.advisoryLockKey] - key to use for advisory lock
	 */
  constructor(options = {}) {
    dbConfig.applicationName = options.applicationName;
    super(dbConfig, options);
    this.seqdepotMigrator_ = null;
  }

  /**
	 * Create the stock MiST migrator and one for the SeqDepot relations.
	 * @returns {Object}
	 */
  setupMigrator() {
    super.setupMigrator();
    this.seqdepotMigrator_ = this.createMigrator_(dbConfig.seqdepot.migrations, 'seqdepot-migrations');
    return this.migrator_;
  }

  /**
	 * Loads both the MiST and SeqDepot models
	 * @returns {Object.<String,Model>}
	 */
  setupModels() {
    if (this.models_)
      return this.models_;

    this.setupSequelize();
    let seqdepotModels = loadSeqdepotModels(this.sequelize_, dbConfig.seqdepot.schema, this.bootLogger_);
    this.models_ = loadMistModels(this.sequelize_, seqdepotModels, this.bootLogger_);
    this.addGlobalClassMethods_(this.models_);
    return this.models_;
  }

  /**
	 * Create any base schema along with the SeqDepot schema.
	 * @returns {Promise}
	 */
  setupSchema() {
    return super.setupSchema()
      .then(this.createSchema_.bind(this, dbConfig.seqdepot.schema));
  }

  /**
	 * Run the seqdepot migrations *before* any of the MiST migrations
	 * @returns {Promise}
	 */
  runPendingMigrations() {
    return this.seqdepotMigrator_.up()
      .then(super.runPendingMigrations.bind(this));
  }

  // ----------------------------------------------------
  // Private methods
  addGlobalClassMethods_(models) {
    Object.values(models).forEach((model) => {
      /**
			 * @returns {Set} - those attributes which are excluded from selection via the CriteriaService
			 */
      if (!model.$excludedFromCriteria) {
        model.$excludedFromCriteria = function() {
          return null;
        };
      }

      /**
			 * @returns {Array.<String>} - attributes that may be selected via the CriteriaService; if null, indicates all attributes may be selected
			 */
      if (!model.$criteriaAttributes) {
        model.$criteriaAttributes = function() {
          return null;
        };
      }

      /**
			 * @returns {String} - name of sequence to be used by IdService; defaults to the model name
			 */
      if (!model.$idSequence) {
        model.$idSequence = function() {
          return this.name;
        };
      }
    });
  }
};
