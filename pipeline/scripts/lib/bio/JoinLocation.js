'use strict'

// Local includes
let AbstractLocation = require('./AbstractLocation'),
	Seq = require('./Seq')

module.exports =
class JoinLocation extends AbstractLocation {
	constructor(locations) {
		super()
		assert(locations instanceof Array, 'locations argument must be an array')
		assert(locations.length > 0, 'locations array must not be empty')
		if (locations.length === 1)
			console.warn('JoinLocation::constructor() - constructed with only one location')
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
