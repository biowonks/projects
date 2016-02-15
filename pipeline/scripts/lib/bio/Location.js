'use strict'

// Local includes
let AbstractLocation = require('./AbstractLocation'),
	Seq = require('./Seq')

module.exports =
class Location extends AbstractLocation {
	constructor(startLocationPoint, stopLocationPoint) {
		this.startLocationPoint_ = startLocationPoint
		this.stopLocationPoint_ = stopLocationPoint
	}

	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		return seq.subseq(this.startLocationPoint_.lowerBound(), this.stopLocationPoint_.upperBound())
	}
}
