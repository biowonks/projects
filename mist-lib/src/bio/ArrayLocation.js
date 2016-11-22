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

	overlaps(otherLocation, isCircular, seqLength) {
		for (let ourLocation of this.locations_) {
			if (otherLocation.overlaps(ourLocation, isCircular, seqLength))
				return true
		}

		return false
	}

	strand() {
		return '+'
	}
}
