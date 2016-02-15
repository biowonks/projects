'use strict'

let LocationPoint = require('./LocationPoint')

// 10.20
module.exports =
class BoundedLocationPoint extends LocationPoint {
	constructor(start, stop) {
		assert(start < stop)
		super(start)
		this.exact_ = false
		this.stop_ = stop
	}

	lowerBound() {
		return this.position_
	}
	upperBound() {
		return this.stop_
	}
}
