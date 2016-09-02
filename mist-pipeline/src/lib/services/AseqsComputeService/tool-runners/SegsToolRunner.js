'use strict'

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner'),
	segStream = require('lib/streams/seg-stream')

module.exports =
class SegsToolRunner extends FastaStreamToolRunner {
	handleResult_(aseq, result) {
		aseq.segs = result.segs
	}

	toolStream_() {
		return segStream()
	}
}

module.exports.meta = {
	id: 'segs',
	description: 'identify low-complexity segments'
}
