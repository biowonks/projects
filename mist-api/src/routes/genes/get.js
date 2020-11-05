'use strict'

const { geneFinderMiddlewares, docs } = require('./genes-route-helpers');

module.exports = function(app, middlewares) {
  return geneFinderMiddlewares(app, middlewares, (req) => req.query)
}

module.exports.docs = docs
