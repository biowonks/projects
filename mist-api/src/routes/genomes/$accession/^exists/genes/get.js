'use strict'

const { memberGenesFinderMiddlewares, docs } = require('./member-genes-route-helpers')

module.exports = function(app, middlewares) {
  return memberGenesFinderMiddlewares(app, middlewares, (req) => req.query)
}

module.exports.docs = docs
