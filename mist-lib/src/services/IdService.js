'use strict';

// Core
const assert = require('assert');

class SequenceNotFoundError extends Error {}

module.exports =
class IdService {
  /**
	 * @constructor
	 * @param {Model} idSequenceModel - Sequelize model
	 * @param {Object} logger - bunyan compatible logger
	 */
  constructor(idSequenceModel, logger) {
    this.idSequenceModel_ = idSequenceModel;
    this.logger_ = logger;
  }

  /**
	 * Allocates ${records.length} identifiers for the sequence associated with ${model} and
	 * updates the ${record}s artificial identifiers with these. Returns a map object which
	 * maps the old identifiers to their equivalent new ids.
	 *
	 * @param {Array.<Object>} records
	 * @param {Model} model
	 * @returns {Promise.<Map.<Number,Number>>} - Map instance mapping old identifers to the new identifers
	 */
  assignIds(records, model) {
    if (!records.length)
      return Promise.resolve(new Map());

    return this.reserve(model.$idSequence(), records.length)
      .then((idRange) => {
        let nextId = idRange[0],
          idMap = new Map();
        records.forEach((record) => {
          let oldId = record.id;
          record.id = nextId;
          idMap.set(oldId, record.id);
          ++nextId;
        });
        return idMap;
      });
  }

  /**
	 * "reserves" or "allocates" ${amount} contiguous identifiers for the sequence named
	 * ${sequenceName} and returns a 2-element array containing the beginning identifier and the
	 * terminal identifier. It uses row-level locking to ensure that simultaneous requests for
	 * the same sequence are handled serially and in order.
	 *
	 * ${sequenceName} is created if not found.
	 *
	 * @param {string} sequenceName name of sequence in database
	 * @param {number} amount number of ids to allocate
	 * @returns {Array.<number>} 2-element array denoting the range of ids that have been allocated
	 */
  reserve(sequenceName, amount) {
    assert(typeof amount === 'number' && amount > 0, 'amount must be a positive integer');

    let result = null;
    return this.idSequenceModel_.sequelize.transaction({
      isolationLevel: 'READ COMMITTED',
    }, (transaction) => {
      return this.idSequenceModel_.findOne({
        where: {
          name: sequenceName,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      })
        .then((idSequence) => {
          if (!idSequence)
            throw new SequenceNotFoundError();

          let start = idSequence.last_value + 1,
            stop = start + amount - 1;

          result = [start, stop];
          idSequence.last_value = stop;
          return idSequence.save({
            fields: ['last_value'],
            transaction,
          });
        })
        .then(() => {
          this.logger_.info({
            sequenceName,
            start: result[0],
            stop: result[1],
          }, `Reserved ${result[1] - result[0] + 1} identifiers for the sequence named '${sequenceName}'`);
          return result;
        });
    })
      .catch(SequenceNotFoundError, () => {
        return this.createDoNothingOnConflict_(sequenceName)
          .then(() => this.reserve(sequenceName, amount));
      });
  }

  /**
	 * Helper method for updating foreign key values. Iterates through each record in ${records}
	 * and replaces the value of record[${foreignKeyField}] with its corresponding value in
	 * ${idMap}.
	 *
	 * @param {Array.<Object>} records
	 * @param {String} foreignKeyField
	 * @param {Map.<Number,Number>} idMap
	 */
  setForeignKeyIds(records, foreignKeyField, idMap) {
    records.forEach((record) => {
      if (record[foreignKeyField] === null)
        return;

      let oldForeignKeyId = record[foreignKeyField],
        newForeignKeyId = idMap.get(oldForeignKeyId);
      assert(!!newForeignKeyId);
      record[foreignKeyField] = newForeignKeyId;
    });
  }

  // ----------------------------------------------------
  // Private methods
  /**
	 * @param {String} sequenceName}
	 * @returns {Promise}
	 */
  createDoNothingOnConflict_(sequenceName) {
    let sql = `INSERT INTO ${this.idSequenceModel_.getTableName()} (name) VALUES (?) ON CONFLICT DO NOTHING`;
    return this.idSequenceModel_.sequelize.query(sql, {
      replacements: [sequenceName],
      type: this.idSequenceModel_.sequelize.QueryTypes.INSERT,
      raw: true,
    })
      .then(() => {
        this.logger_.info(`created a new id sequence ${sequenceName}`);
      });
  }
};
