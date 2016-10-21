'use strict'

// Core
const assert = require('assert')

// Local
const ArrayLocation = require('./ArrayLocation'),
	Seq = require('core-lib/bio/Seq')

module.exports =
class JoinLocation extends ArrayLocation {
	// Overlaps are permitted
	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		let seqStrings = this.locations_.map((location) => location.transcriptFrom(seq).sequence())

		return new Seq(seqStrings.join(''))
	}
}
