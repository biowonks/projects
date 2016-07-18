/* eslint-disable valid-jsdoc */

'use strict'

// Core
const assert = require('assert')

module.exports =
class AbstractLocation {
	transcriptFrom(seq) {
		throw new Error('not implemented')
	}

	/**
	 * Returns the total length of this location relative to ${seqLength} (which is necessary for
	 * circular sequences).
	 *
	 * @param {Boolean} isCircular
	 * @param {Number} seqLength
	 * @returns {Number}
	 */
	length(isCircular, seqLength) {
		let lowerBound = this.lowerBound(),
			upperBound = this.upperBound()

		assert(typeof seqLength === 'number', 'seqLength is not defined')
		assert(lowerBound <= seqLength, 'lower bound exceeds sequence length')
		assert(upperBound <= seqLength, 'upper bound exceeds sequence length')

		if (!isCircular || lowerBound <= upperBound)
			return upperBound - lowerBound + 1

		return (seqLength - lowerBound + 1) + (upperBound - 1 + 1)
	}

	/**
	 * Returns the most definite, absolute lower bound this location occupies.
	 *
	 * @returns {Number}
	 */
	lowerBound() {
		throw new Error('not implemented')
	}

	/**
	 * Returns the most definite, absolute upper bound this location occupies.
	 *
	 * @returns {Number}
	 */
	upperBound() {
		throw new Error('not implemented')
	}

	/**
	 * @returns {String}
	 */
	strand() {
		throw new Error('not implemented')
	}
}
