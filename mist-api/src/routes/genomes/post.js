'use strict'

// Vendor
const bodyParser = require('body-parser')
// Local
const { genomeFinderMiddlewares, docs } = require('./genomes-route-helpers')

module.exports = function(app, middlewares) {
  return [
    bodyParser.urlencoded({extended: false}),
    ...genomeFinderMiddlewares(app, middlewares, (req) => req.body)
  ]
}

module.exports.docs = docs
