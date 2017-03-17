'use strict'

// Local
const AbstractLocation = require('./AbstractLocation')

module.exports =
class MockLocation extends AbstractLocation {
	constructor(lowerBound, upperBound) {
		super()
		this.lowerBound_ = lowerBound
		this.upperBound_ = upperBound
	}

	lowerBound() {
		return this.lowerBound_
	}

	upperBound() {
		return this.upperBound_
	}
}
