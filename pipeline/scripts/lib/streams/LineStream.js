/**
 * LineStream functions as a base class for other custom stream classes that
 * depend on receiving input line by line. It is not intended to be used on its
 * own as there are simpler and more efficient ways to achieve that (e.g.
 * dominctarr/split).
 *
 * Notes:
 * - Input is expected to be utf8 compatible
 *
 * - Output is encoded in utf8
 */
'use strict'

// Core
let stream = require('stream')

// Vendor
let byline = require('byline')

module.exports =
class LineStream extends stream.Transform {
	constructor() {
		super({objectMode: true})

		this.byLineStream_ = new byline.LineStream({encoding: 'utf8'})
		this.byLineStream_.pipe(this)

		this.on('pipe', (src) => {
			src.unpipe(this)
			src.pipe(this.byLineStream_)
		})
	}

	_transform(line, encoding, done) {
		this.push(line)
		done()
	}
}
