'use strict'

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner')
const hmmscanStream = require('lib/streams/hmmscan-stream')

module.exports =
class Pfam31ToolRunner extends FastaStreamToolRunner {
	handleResult_(aseq, result) {
		aseq.pfam31 = result.domains
	}

	toolStream_() {
		return hmmscanStream(this.config_.databasePath, this.config_.z, this.config_.cpus)
	}
}

module.exports.meta = {
	id: 'pfam31',
	description: 'predict pfam31 domains'
}
