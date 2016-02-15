'use strict'

let Location = require('./Location'),
	Seq = require('./Seq')

module.exports =
class ComplementLocation extends Location {
	constructor(startLocationPoint, stopLocationPoint) {
		super(startLocationPoint, stopLocationPoint)
	}

	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		return super.transcriptFrom(seq).reverseComplement()
	}
}
