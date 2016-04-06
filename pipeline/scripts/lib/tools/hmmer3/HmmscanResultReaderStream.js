'use strict'

// Core node libraries
let Transform = require('stream').Transform

/**
 * HmmscanResultReaderStream parses raw HmmScan data and streams out objects
 * containing these results.
 */
module.exports =
class HmmscanResultReaderStream extends Transform {
	constructor() {
		super({objectMode: true})
	}

	_transform(chunk, encoding, done) {
		// TODO: Implement hmmscan result parsing here!
		done()
	}

	_flush(done) {
		// TODO: Process any remaining buffer data (see FastaReaderStream for an example)
		done()
	}
}
