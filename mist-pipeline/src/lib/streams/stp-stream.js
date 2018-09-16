'use strict'

// Vendor
const through2 = require('through2')

module.exports = function(stpService, options) {
  return through2.obj((aseq, encoding, done) => {
    let stp = null
    try {
      stp = stpService.analyze(aseq)
    }
    catch (error) {
      done(error)
      return
    }

    done(null, stp || false)
  })
}
