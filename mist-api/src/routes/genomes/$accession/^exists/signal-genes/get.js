'use strict'

const { signalGeneFinderMiddlewares, docs } = require('./signal-genes-route-helpers')

module.exports = function(app, middlewares) {
  return signalGeneFinderMiddlewares(app, middlewares, (req) => { return req.query })
}

module.exports.docs = docs
