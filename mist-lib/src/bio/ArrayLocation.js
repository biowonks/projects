'use strict'

// Core
const assert = require('assert')

// Local
const AbstractLocation = require('./AbstractLocation')

/**
 * ArrayLocation simply groups one or more child locations.
 */
module.exports =
class ArrayLocation extends AbstractLocation {
	constructor(locations) {
		super()
		assert(locations instanceof Array, 'locations argument must be an array')
		assert(locations.length > 0, 'locations array must not be empty')
		if (locations.length === 1)
			// eslint-disable-next-line no-console
			console.warn('ArrayLocation::constructor() - constructed with only one location')
		this.locations_ = locations
	}

	length(isCircular, seqLength) {
		let sum = 0
		for (let location of this.locations_)
			sum += location.length(isCircular, seqLength)
		return sum
	}

	lowerBound() {
		return this.locations_[0].lowerBound()
	}

	upperBound() {
		return this.locations_[this.locations_.length - 1].upperBound()
	}

	strand() {
		return '+'
	}
}
