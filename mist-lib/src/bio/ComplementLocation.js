'use strict'

// Core
const assert = require('assert')

// Local
const AbstractLocation = require('./AbstractLocation'),
	Seq = require('core-lib/bio/Seq')

module.exports =
class ComplementLocation extends AbstractLocation {
	constructor(location) {
		assert(location instanceof AbstractLocation, 'location argument is not a valid AbstractLocation instance')
		super()
		this.location_ = location
	}

	lowerBound() {
		return this.location_.lowerBound()
	}

	upperBound() {
		return this.location_.upperBound()
	}

	strand() {
		return '-'
	}

	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		return this.location_.transcriptFrom(seq).reverseComplement()
	}
}
