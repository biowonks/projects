'use strict';

// Core
const assert = require('assert');

// Vendor
const _ = require('lodash');
const {Op} = require('sequelize');

// Local
const util = require('core-lib/util');

exports.splitIntoMatchAnywhereTerms = (value) => {
  return util.splitIntoTerms(value).map((term) => `%${term}%`);
};

exports.assignExactMatchCriteria = (queryValue, target, fields) => {
  assert(target);

  const terms = util.splitIntoTerms(queryValue);
  if (!terms.length) {
    return;
  }

  fields.forEach((fieldName) => {
    _.set(target, ['criteria', 'where', Op.or, fieldName], terms);
  });
};

exports.assignPartialMatchCriteria = (queryValue, target, fields) => {
  assert(target);

  const terms = exports.splitIntoMatchAnywhereTerms(queryValue);
  if (!terms.length) {
    return;
  }

  fields.forEach((fieldName) => {
    _.set(target, ['criteria', 'where', Op.or, fieldName, Op.iLike, Op.all], terms);
  });
};
