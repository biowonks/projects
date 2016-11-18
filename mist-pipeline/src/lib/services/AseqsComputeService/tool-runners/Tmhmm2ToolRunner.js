'use strict'

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner'),
	tmhmm2Stream = require('lib/streams/tmhmm2-stream')

module.exports =
class Tmhmm2ToolRunner extends FastaStreamToolRunner {
	static isEnabled() {
		return tmhmm2Stream.tmhmm2IsInstalled()
	}

	handleResult_(aseq, result) {
		aseq.tmhmm2 = {
			topology: result.topology,
			tms: result.tms
		}
	}

	toolStream_() {
		return tmhmm2Stream()
	}
}

module.exports.meta = {
	id: 'tmhmm2',
	description: 'predict transmembrane regions'
}
