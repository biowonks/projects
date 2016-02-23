'use strict'

// Local includes
let Location = require('./AbstractLocation'),
	Seq = require('./Seq')

module.exports =
class ComplementLocation extends AbstractLocation {
	constructor(location) {
		assert(location instanceof AbstractLocation, 'location argument is not a valid AbstractLocation instance')
		super()
		this.location_ = location
	}

	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		return this.location_.transcriptFrom(seq).reverseComplement()
	}
}
