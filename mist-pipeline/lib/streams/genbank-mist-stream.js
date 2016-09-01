'use strict'

// Vendor
const through2 = require('through2')

// Local
const GenbankMistAdapter = require('../GenbankMistAdapter')

module.exports = function(genomeId) {
	let genbankMistAdapter = new GenbankMistAdapter(genomeId)

	return through2.obj((genbankRecord, encoding, done) => {
		let mistData = null
		try {
			mistData = genbankMistAdapter.formatRefSeq(genbankRecord)
		}
		catch (error) {
			done(error)
			return
		}

		done(null, mistData)
	})
}
