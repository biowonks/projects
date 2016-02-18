'use strict'

// Core node libraries
let assert = require('assert')

// 345 or -1
module.exports =
class LocationPoint {
	constructor(position) {
		assert(typeof position === 'number', 'position argument must be a number')
		assert(position !== 0, 'position argument cannot be zero')
		this.position_ = position
		this.exact_ = true
	}

	isExact() {
		return this.exact_
	}

	lowerBound() {
		return this.position_
	}

	upperBound() {
		return this.position_
	}
}
