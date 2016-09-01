'use strict'

// Core
const assert = require('assert')

// Local
const LocationPoint = require('./LocationPoint')

// 10^11
module.exports =
class BetweenLocationPoint extends LocationPoint {
	constructor(start, stop) {
		assert(typeof start === 'number', 'start must be a number')
		assert(typeof stop === 'number', 'stop must be a number')
		assert(start + 1 === stop)
		super(start)
	}

	upperBound() {
		return this.position_ + 1
	}
}
