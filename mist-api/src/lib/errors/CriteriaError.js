'use strict';

// Local
const BadRequestError = require('./BadRequestError');

/**
 * @constructor
 *
 * @param {String} optMessage
 * @param {*} optData arbitrary relevant data
 */
module.exports =
class CriteriaError extends BadRequestError {
  constructor(optMessage, optData) {
    super(optMessage, optData);
    this.name = 'CriteriaError';
  }
};
