'use strict'

// Core node libraries
let Transform = require('stream').Transform

// 3rd party libraries
let LineStream = require('byline').LineStream

module.exports =
class NdJsonReaderStream extends Transform {
	/**
	 * Stream for parsing newline delimited (nd) JSON.
	 *
	 * @constructor
	 */
	constructor() {
		super({objectMode: true})

		this.lineStream_ = new LineStream()
		this.lineStream_.pipe(this)

		this.on('pipe', (src) => {
			src.unpipe(this)
			src.pipe(this.lineStream_)
		})
	}

	// ----------------------------------------------------
	// Private methods
	_transform(line, encoding, done) {
		if (line)
			this.push(JSON.parse(line.toString()))
		done()
	}
}
