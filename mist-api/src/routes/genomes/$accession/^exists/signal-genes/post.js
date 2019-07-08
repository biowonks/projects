'use strict'

// Vendor
const bodyParser = require('body-parser')
// Local
const { signalGeneFinderMiddlewares, docs } = require('./signal-genes-route-helpers')

module.exports = function(app, middlewares) {
  return [
    bodyParser.urlencoded({extended: false}),
    ...signalGeneFinderMiddlewares(app, middlewares, req => req.body)
  ]
}

module.exports.docs = docs
