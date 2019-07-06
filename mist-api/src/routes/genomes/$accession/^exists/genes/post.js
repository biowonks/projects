'use strict'

// Vendor
const bodyParser = require('body-parser')
// Local
const { memberGenesFinderMiddlewares, docs } = require('./member-genes-route-helpers')

module.exports = function(app, middlewares) {
  return [
    bodyParser.urlencoded({extended: false}),
    ...memberGenesFinderMiddlewares(app, middlewares, (req) => { return req.body })
  ]
}

module.exports.docs = docs
