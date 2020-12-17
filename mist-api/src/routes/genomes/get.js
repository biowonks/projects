'use strict';

const {genomeFinderMiddlewares, docs} = require('./genomes-route-helpers');

module.exports = function(app, middlewares) {
  return genomeFinderMiddlewares(app, middlewares, (req) => req.query);
};

module.exports.docs = docs;
