'use strict'

const { signalGeneFinderMiddlewares, docs } = require('./signal-genes-route-helpers')

module.exports = function(app, middlewares) {
  return signalGeneFinderMiddlewares(app, middlewares, req => req.query)
}

module.exports.docs = docs
