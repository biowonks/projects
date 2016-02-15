'use strict'

// 345
module.exports =
class LocationPoint {
	constructor(position) {
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
