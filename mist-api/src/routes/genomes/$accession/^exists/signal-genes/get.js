'use strict'

const getPostHelpers = require('./get-post-helpers')

module.exports = function(app, middlewares, routeMiddlewares) {
  const isPOST = false
  return getPostHelpers.signalGeneFinder(app, middlewares, isPOST)
}

module.exports.docs = getPostHelpers.docs
