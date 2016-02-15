'use strict'

let LocationPoint = require('./LocationPoint')

// 10^11
module.exports =
class BetweenLocationPoint extends LocationPoint {
	constructor(start, stop) {
		assert(start + 1 === stop)
		super(start)
	}

	upperBound() {
		return this.position_ + 1
	}
}
