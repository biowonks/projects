'use strict'

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner')
const seqUtil = require('core-lib/bio/seq-util')
const tmhmm2Stream = require('lib/streams/tmhmm2-stream')

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

	getFasta_(aseq) {
		/**
		 * TMHMM2 only permits the following characters: ABCDEFGHI_KLMN_PQRST_VWYXZ.
		 * The following replaces all J, O, and U's with N
		 */
		const tmhmmCompatibleSequence = aseq.sequence.replace(/[JOU]/g, 'N')
		return seqUtil.fasta(aseq.id, tmhmmCompatibleSequence)
	}
}

module.exports.meta = {
	id: 'tmhmm2',
	description: 'predict transmembrane regions'
}
