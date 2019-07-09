'use strict'

// Vendor
const bodyParser = require('body-parser')
// Local
const { geneFinderMiddlewares, docs } = require('./genes-route-helpers');

module.exports = function(app, middlewares) {
  return [
    bodyParser.urlencoded({extended: false}),
    ...geneFinderMiddlewares(app, middlewares, (req) => req.body)
  ]
}

module.exports.docs = docs
