'use strict'

// Core includes
let Transform = require('stream').Transform

// 3rd party includes
let ByLineStream = require('byline').LineStream

module.exports =
class LineStream extends Transform {
	constructor() {
		super({objectMode: true})

		this.byLineStream_ = new ByLineStream()
		this.byLineStream_.pipe(this)

		this.on('pipe', (src) => {
			src.unpipe(this)
			src.pipe(this.byLineStream_)
		})
	}
}
