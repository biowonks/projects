'use strict'

let AbstractLocation = require('./AbstractLocation'),
	Seq = require('./Seq')

module.exports =
class JoinLocation extends AbstractLocation {
	constructor(locations) {
		super()
		assert(locations instanceof Array, 'JoinLocation must be instantiated with an array of Location instances')
		this.locations_ = locations
	}

	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		let seqStrings = this.locations_.map((location) => {
			return location.transcriptFrom(seq).sequence()
		})

		return new Seq(seqStrings.join(''), true /* don't clean */)
	}
}
