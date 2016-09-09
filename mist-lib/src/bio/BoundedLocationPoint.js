'use strict'

// Core
const assert = require('assert')

// Local
const LocationPoint = require('./LocationPoint')

// 10.20
module.exports =
class BoundedLocationPoint extends LocationPoint {
	constructor(start, stop) {
		super(start)
		assert(typeof stop === 'number', 'stop argument must be a number')
		assert(stop !== 0, 'stop argument cannot be zero')
		assert(start < stop, 'start must be less than stop')
		this.exact_ = false
		this.stop_ = stop
	}

	upperBound() {
		return this.stop_
	}
}
