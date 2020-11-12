'use strict';

// Core
const fs = require('fs');
const path = require('path');

// Vendor
const Promise = require('bluebird');

// Local
const AseqsService = require('mist-lib/services/AseqsService');

// Other
const kToolRunners = discoverToolRunners();
const kToolRunnerIdMap = new Map(kToolRunners.map((x) => [x.id, x]));

module.exports =
class AseqsComputeService extends AseqsService {
  static tools() {
    return kToolRunners;
  }

  static toolRunnerIdMap() {
    return kToolRunnerIdMap;
  }

  constructor(models, model, config, logger) {
    super(models, model, logger);
    this.config_ = config;
  }

  targetAseqFields(toolIds) {
    const aseqFields = new Set();

    toolIds
      .map((toolId) => AseqsComputeService.toolRunnerIdMap().get(toolId))
      .filter((meta) => !!meta)
      .map((meta) => meta.requiredAseqFields || [])
      .forEach((toolAseqFields) => {
        toolAseqFields.forEach((toolAseqField) => {
          aseqFields.add(toolAseqField);
        });
      });

    return Array.from(aseqFields);
  }

  /**
	 * @param {Array.<Aseq>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Aseq>} - aseqs decorated with the computed results
	 */
  compute(aseqs, toolIds) {
    let invalidToolId = this.firstInvalidToolId(toolIds);
    if (invalidToolId)
      return Promise.reject(new Error(`invalid tool id: ${invalidToolId}`));

    return Promise.each(toolIds, (toolId) => {
      // eslint-disable-next-line no-mixed-requires
      const meta = kToolRunnerIdMap.get(toolId);
      const ToolRunner = require(meta.path); // eslint-disable-line global-require
      const toolRunnerConfig = this.config_.toolRunners[toolId];
      const toolRunner = new ToolRunner(toolRunnerConfig, this.models_);

      toolRunner.on('progress', (progress) => {
        this.logger_.info(progress, `${toolId} progress event: ${Math.floor(progress.percent)}%`);
      });

      return toolRunner.setup_()
        .then(() => toolRunner.run(aseqs));
    })
      .then(() => aseqs);
  }

  /**
	 * Updates the values of ${toolIds} of each ${aseqs} if they are null. Non-tool id fields are
	 * ignored and existing database values takes precedence over any of the direct Aseq values.
	 *
	 * @param {Array.<Aseq>} aseqs
	 * @param {Array.<String>} toolIds
	 * @param {string} [alternateCondition] additional condition to use when updating aseqs; should contain correct boolean operator
	 * @param {Transaction} [transaction=null]
	 * @returns {Array.<Aseq>}
	 */
  saveToolData(aseqs, toolIds, alternateCondition = '', transaction = null) {
    if (!toolIds.length)
      return Promise.resolve(aseqs);

    let aseqsCopy = aseqs.slice();

    // Sort all records by their id field so as to update them in the primary key order
    // and thereby avoid potential deadlock issues stemming from concurrent access.
    //
    // http://stackoverflow.com/questions/1520417/deadlock-error-in-insert-statement
    // http://stackoverflow.com/a/1521183
    aseqsCopy.sort((a, b) => {
      if (a.id < b.id)
        return -1;
      if (a.id > b.id)
        return 1;

      return 0;
    });

    const setSql = toolIds.map((toolId) => `${toolId} = ?`).join(', ');
    const nullClause = toolIds.map((toolId) => `${toolId} IS NULL`).join(' OR ');
    const replacements = [];
    const nToolIds = toolIds.length;
    const sql = `
UPDATE ${this.model_.getTableName()}
SET ${setSql}
WHERE id = ? AND (${nullClause} ${alternateCondition})`;

    return Promise.each(aseqsCopy, (aseq) => {
      for (let i = 0; i < nToolIds; i++)
        replacements[i] = JSON.stringify(aseq.getDataValue(toolIds[i]));
      replacements[nToolIds] = aseq.id;

      return this.sequelize_.query(sql, {
        replacements,
        plain: true,
        type: this.sequelize_.QueryTypes.UPDATE,
        transaction,
      });
    });
  }

  /**
	 * Splits ${aseqs} into groups based on which ${toolIds} have not been
	 * @param {Array.<Aseq>} aseqs
	 * @param {Array.<String>} toolIds
	 * @returns {Array.<Object>}
	 */
  groupByUndoneTools(aseqs, toolIds) {
    let map = new Map();
    for (let i = 0, z = aseqs.length; i < z; i++) {
      let aseq = aseqs[i],
        undoneToolIds = [];
      toolIds.forEach((toolId) => {
        if (!aseq[toolId])
          undoneToolIds.push(toolId);
      });
      let key = undoneToolIds.join('|');
      if (map.has(key))
        map.get(key).push(aseq);
      else
        map.set(key, [aseq]);
    }

    let groups = [];
    for (let key of map.keys()) {
      groups.push({
        aseqs: map.get(key),
        toolIds: key.length ? key.split('|') : [],
      });
    }
    return groups;
  }

  firstInvalidToolId(toolIds) {
    for (let toolId of toolIds) {
      if (!this.isValidToolId(toolId))
        return toolId;
    }

    return null;
  }

  isValidToolId(toolId) {
    return kToolRunnerIdMap.has(toolId);
  }
};

/**
 * @returns {Array.<Object>} - array of supported AseqsService tools (as determined by querying the tool-runners subdirectory). Each object contains each tool-runner's meta data and an id field which is the basename of the tool-runner.
 */
function discoverToolRunners() {
  let basePath = 'tool-runners',
    toolRunnersDir = path.join(__dirname, basePath),
    suffix = 'ToolRunner.js';

  return fs.readdirSync(toolRunnersDir)
    .filter((fileName) => {
      let file = path.join(toolRunnersDir, fileName),
        stat = fs.statSync(file);

      return stat.isFile() && fileName.endsWith(suffix);
    })
    .map((fileName) => {
      // eslint-disable-next-line no-mixed-requires
      let runnerPath = `./${basePath}/${fileName}`,
        runner = require(runnerPath); // eslint-disable-line global-require

      runner.$path = runnerPath;

      return runner;
    })
    .filter((runner) => runner.isEnabled())
    .map((runner) => {
      let meta = runner.meta || {};
      meta.path = runner.$path;
      Reflect.deleteProperty(runner, '$path');
      return meta;
    })
  // Only include those that have a non-null id
    .filter((x) => !!x.id);
}
