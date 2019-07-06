'use strict'

const { memberGenesFinderMiddlewares, docs } = require('./member-genes-route-helpers')

module.exports = function(app, middlewares) {
  return memberGenesFinderMiddlewares(app, middlewares, (req) => { return req.query })
}

module.exports.docs = docs
