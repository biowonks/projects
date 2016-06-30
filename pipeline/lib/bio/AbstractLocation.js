'use strict'

module.exports =
class AbstractLocation {
	transcriptFrom(seq) {
		throw new Error('not implemented')
	}

	/**
	 * Returns the most definite, absolute lower bound this location occupies.
	 */
	lowerBound() {
		throw new Error('not implemented')
	}

	/**
	 * Returns the most definite, absolute upper bound this location occupies.
	 */
	upperBound() {
		throw new Error('not implemented')
	}

	strand() {
		throw new Error('not implemented')
	}
}
