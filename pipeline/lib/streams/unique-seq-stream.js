'use strict'

// Vendor
const through2 = require('through2')

module.exports = function(options) {
	let seqIds = new Set()

	return through2.obj(options, (seq, encoding, done) => {
		let seqId = null
		try {
			seqId = seq.seqId()
		}
		catch (error) {
			done(error)
			return
		}

		if (!seqIds.has(seqId)) {
			seqIds.add(seqId)
			done(null, seq)
		}
		else {
			done()
		}
	})
}
