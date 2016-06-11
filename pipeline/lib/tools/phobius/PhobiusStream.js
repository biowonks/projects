/* eslint-disable */
'use strict'

// Core node libraries
let child_process = require('child_process'),
	path = require('path'),
	Transform = require('stream').Transform

// Local includes
let PhobiusResultStream = require('./PhobiusResultStream')

// Constants
let kPhobiusToolDir = path.resolve(__dirname, 'phobius'),
	kPhobiusToolFile = path.resolve(kPhobiusToolDir, 'phobius.pl')

module.exports =
class PhobiusStream extends Transform {
	constructor() {
		super({objectMode: true})

		this.phobiusTool_ = child_process.spawn(kPhobiusToolFile, ['-short'])
		this.phobiusResultStream_ = new PhobiusResultStream()
		this.phobiusResultStream_.pipe(this)

		let self = this
		this.on('pipe', function(src) {
			src.unpipe(self)

			src.pipe(self.phobiusTool_.stdin)
			self.phobiusTool_.stdout.pipe(self.phobiusResultStream_)
		})
	}

	_transform(result, encoding, done) {
		this.push(result)
		done()
	}
}
