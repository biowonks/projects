'use strict'

// Core
const assert = require('assert')

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

	/**
	 * Definite: not necessarily exact, but a base position that may serve as at least
	 * a known position to start from. For example, <10 has a definite start because while
	 * its exact start is somewhere before 10, it must include 10 itself. On the other hand,
	 * >10 is not a definite start. It simply tells us the start was not before base 11.
	 * The opposite logic applies to hasDefiniteStop().
	 *
	 * The reason these became necessary originated with the Location::transcriptFrom(Seq)
	 * method, which needed a mechanism for dealing with invalid locations such as:
	 * >10..<15.
	 *
	 * @returns {boolean} always true for this base class implementation
	 */
	hasDefiniteStart() {
		return true
	}

	/**
	 * @see hasDefiniteStart() for details.
	 * @returns {boolean} always true for this base class implementation
	 */
	hasDefiniteStop() {
		return true
	}
}
