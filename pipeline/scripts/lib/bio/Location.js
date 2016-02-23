'use strict'

// Core node libraries
let assert = require('assert')

// Local includes
let AbstractLocation = require('./AbstractLocation'),
	LocationPoint = require('./LocationPoint'),
	Seq = require('./Seq')

module.exports =
class Location extends AbstractLocation {
	constructor(startLocationPoint, stopLocationPoint) {
		super()
		assert(startLocationPoint instanceof LocationPoint, 'startLocationPoint argument must be a LocationPoint instance')
		assert(stopLocationPoint instanceof LocationPoint, 'stopLocationPoint argument must be a LocationPoint instance')
		this.startLocationPoint_ = startLocationPoint
		this.stopLocationPoint_ = stopLocationPoint
	}

	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		assert(this.startLocationPoint_.hasDefiniteStart(), 'starting location point does not have definite start')
		assert(this.stopLocationPoint_.hasDefiniteStop(), 'stop location point does not have definite stop')
		return seq.subseq(this.startLocationPoint_.lowerBound(), this.stopLocationPoint_.upperBound())
	}
}
