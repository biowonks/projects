'use strict';

// Core
const assert = require('assert');

module.exports =
class AbstractSeqsService {
  constructor(models, model, logger) {
    this.models_ = models;
    this.model_ = model;
    this.logger_ = logger;
    this.sequelize_ = model.sequelize;
    this.attributes_ = Object.keys(this.model_.rawAttributes);

    assert(this.logger_, 'Missing logger argument');
  }

  insertIgnoreSeqs(seqs, fields, transaction) {
    if (!seqs.length)
      return Promise.resolve();

    const records = seqs.map(this.model_.dataFromSeq);

    // Sort all records by their id field so as to insert them in the same order and thereby
    // avoid potential deadlock issues.
    //
    // http://stackoverflow.com/questions/1520417/deadlock-error-in-insert-statement
    // http://stackoverflow.com/a/1521183
    records.sort((a, b) => {
      if (a.id < b.id)
        return -1;
      if (a.id > b.id)
        return 1;

      return 0;
    });

    let sql = this.model_.queryGenerator.bulkInsertQuery(
      this.model_.getTableName(),
      records,
      {fields},
      this.attributes_,
    );

    if (sql.endsWith(';'))
      sql = sql.slice(0, -1);

    sql += ' ON CONFLICT DO NOTHING;';

    return this.model_.sequelize.query(sql, {
      raw: true,
      transaction,
    });
  }
};
