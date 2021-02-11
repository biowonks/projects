'use strict';

// Core
const assert = require('assert');

// Vendor
const Sequelize = require('sequelize');

module.exports =
class AbstractPipelineModule {
  constructor(app) {
    this.config_ = app.config;
    this.logger_ = app.logger;
    this.query_ = (app.query || '').trim();
    this.models_ = app.models;
    this.sequelize_ = app.sequelize;
    this.worker_ = app.worker;
    this.shutdownCheck_ = app.shutdownCheck;
  }

  // ----------------------------------------------------
  // The following static methods are intended as a reference for implementing in derived classes.
  // Given their static nature, they are not inherited and would be meaningless even if they were.
  // Each module class should implement whichever methods are relevant for the CLI.
  /**
	 * @returns {String} - short module description
	 */
  static description() {
    return '';
  }

  /**
	 * @returns {String} - any other helpful information
	 */
  static moreInfo() {
    return '';
  }

  /**
	 * To reference a submodule, simply suffix the module name with a colon and then the submodule
	 * name (e.g. AseqCompute:pfam31).
	 *
	 * @returns {Array.<String>} - one or more "flat" module id strings
	 */
  static dependencies() {
    return []; // this module doesn't depend on anything else
  }

  /**
	 * Example return value:
	 * {
	 *   stp: {
	 *     description: 'predict signal transduction proteins',
	 *     dependencies: [
	 *       'AseqCompute:pfam31',
	 *       'AseqCompute:agfam2',
	 *       ...
	 *     ]
	 *   },
	 *   ...
	 * }
	 *
	 * @returns {Map.<String,Object>} - a map with submodule names as keys that maps to an object with a description and dependencies keys
	 */
  static subModuleMap() {
    return new Map();
  }

  // ----------------------------------------------------
  // Public methods
  /**
	 * @param {Object} options
	 * @param {boolean} options.optimize if true, run optimization routine after each module completes
	 * @returns {Promise.<WorkerModule[]>}
	 */
  async main(options) {
    await this.setup();
    this.shutdownCheck_();
    let workerModules = await this.createWorkerModules_();
    try {
      await this.run();
    }
    catch (error) {
      await this.updateWorkerModulesState_(workerModules, 'error');
      throw error;
    }
    await this.updateWorkerModulesState_(workerModules, 'done');
    await this.afterRun();
    this.shutdownCheck_();
    if (options && options.optimize) {
      await this.optimize();
      this.shutdownCheck_();
    }
    await this.teardown();
    return workerModules;
  }

  /**
	 * @param {Array.<WorkerModule>} workerModules
	 * @param {Object} options
	 * @param {boolean} options.optimize if true, run optimization routine after each module completes
	 * @returns {Promise.<void>}
	 */
  async mainUndo(workerModules, options) {
    await this.setup();
    this.shutdownCheck_();
    let priorWorkerModuleStates = workerModules.map((x) => x.state);
    await this.updateWorkerModulesState_(workerModules, 'undo');
    try {
      await this.undo();
    }
    catch (error) {
      await this.restorePriorState_(workerModules, priorWorkerModuleStates);
      throw error;
    }
    await this.deleteWorkerModules_(workerModules);
    if (options && options.optimize)
      await this.optimize();
    this.shutdownCheck_();
    await this.teardown();
  }

  name() {
    return this.constructor.name;
  }

  // -----------------
  // Protected methods
  setup() {
  }

  undo() {
    throw new Error('not implemented');
  }

  run() {
    throw new Error('not implemented');
  }

  afterRun() {
  }

  optimize() {
  }

  teardown() {
  }

  async analyze(...tableNames) {
    for (const tableName of tableNames) {
      this.logger_.info({tableName: tableName.toString()}, `Analyzing table: ${tableName}`);
      await this.sequelize_.query(`ANALYZE ${tableName}`, {raw: true});
    }
  }

  workerModuleRecords() {
    return [this.newWorkerModuleData()];
  }

  newWorkerModuleData() {
    return {
      worker_id: this.worker_.id,
      module: this.name(),
      state: 'active',
      started_at: this.sequelize_.fn('clock_timestamp'),
    };
  }

  // ----------------------------------------------------
  // Private methods
  /**
	 * The pipeline will attempt to redo modules that are in the error state. Thus, it is likely
	 * that a worker module will already exist. This method first destroys any existing worker
	 * module records and then creates a new batch for each worker module record reported by child
	 * modules implementations.
	 *
	 * @returns {Promise.<WorkerModule>}
	 */
  createWorkerModules_() {
    // Most modules will only have one corresponding WorkerModule; however, in some cases,
    // such as AseqCompute, there may be multiple worker modules. Thus, dealing with an array
    // or worker modules is supported here.
    let workerModuleRecords = this.workerModuleRecords();
    return this.sequelize_.transaction(async (transaction) => {
      await this.models_.WorkerModule.destroy({
        where: {
          genome_id: workerModuleRecords[0].genome_id || null,
          state: 'error',
          module: {
            [Sequelize.Op.in]: workerModuleRecords.map((x) => x.module),
          },
        },
        transaction,
      });
      const newWorkerModules = await this.models_.WorkerModule.bulkCreate(workerModuleRecords, {
        validate: true,
        returning: true,
        transaction,
      });
      return newWorkerModules;
    });
  }

  /**
	 * @param {Array.<WorkerModule>} workerModules
	 * @returns {Promise}
	 */
  deleteWorkerModules_(workerModules) {
    return this.sequelize_.transaction(async (transaction) => {
      for (const workerModule of workerModules) {
        await workerModule.destroy({transaction});
      }
    });
  }

  /**
	 * Updates the state of multiple worker modules to ${newState}
	 *
	 * @param {Array.<WorkerModule>} workerModules
	 * @param {String} newState
	 * @returns {Promise}
	 */
  updateWorkerModulesState_(workerModules, newState) {
    return this.sequelize_.transaction(async (transaction) => {
      for (const workerModule of workerModules) {
        await workerModule.updateState(newState, transaction);
      }
    });
  }

  restorePriorState_(workerModules, priorWorkerModuleStates) {
    assert(workerModules.length === priorWorkerModuleStates.length);

    return this.sequelize_.transaction(async (transaction) => {
      let i = 0;
      for (const workerModule of workerModules) {
        await workerModule.updateState(priorWorkerModuleStates[i], transaction);
        i++;
      }
    });
  }
};
