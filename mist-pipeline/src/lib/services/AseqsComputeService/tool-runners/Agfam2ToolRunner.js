'use strict'

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner'),
	hmmscanStream = require('lib/streams/hmmscan-stream')

module.exports =
class Agfam2ToolRunner extends FastaStreamToolRunner {
	handleResult_(aseq, result) {
		aseq.agfam2 = result.domains
	}

	toolStream_() {
		return hmmscanStream(this.config_.databasePath, this.config_.z, this.config_.cpus)
	}
}

module.exports.meta = {
	id: 'agfam2',
	description: 'predict agfam2 domains'
}
