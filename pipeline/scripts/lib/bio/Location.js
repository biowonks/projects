'use strict'

let Seq = require('./Seq')

// 345
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

// <10 or >10
class FuzzyLocationPoint extends LocationPoint {
	constructor(operator, position) {
		assert(operator === '>' || operator === '<')
		super(position)
		this.exact_ = false
	}
}

// 10^11
class BetweenLocationPoint extends LocationPoint {
	constructor(start, stop) {
		assert(start + 1 === stop)
		super(start)
	}

	upperBound() {
		return this.position_ + 1
	}
}

// 10.20
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

module.exports =
class AbstractLocation {
	transcriptFrom(seq) {
		throw new Error('Unimplemented')
	}
}

class Location extends AbstractLocation {
	constructor(startLocationPoint, stopLocationPoint) {
		this.startLocationPoint_ = startLocationPoint
		this.stopLocationPoint_ = stopLocationPoint
	}

	transcriptFrom(seq) {
		assert(typeof seq !== string, 'seq is not a valid Seq object')
		return seq.substr(this.startLocationPoint_.lowerBound(), this.stopLocationPoint_.upperBound())
	}
}

class PointLocation extends Location {
	constructor(locationPoint) {
		super(locationPoint, locationPoint)
	}
}

class ComplementLocation extends Location {
	constructor(startLocationPoint, stopLocationPoint) {
		super(startLocationPoint, stopLocationPoint)
	}

	transcriptFrom(seq) {
		return super.transcriptFrom(seq).complement()
	}
}

class JoinLocation extends AbstractLocation {
	constructor(locations) {
		assert(locations instanceof Array, 'ComplexLocation requires an array of locations')
	}

	transcriptFrom(seq) {
		let seqStrings = this.locations_.map((location) => {
			return location.transcriptFrom(seq).sequence()
		})

		return new Seq(seqStrings.join(''), true /* don't clean */)
	}
}
