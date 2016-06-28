'use strict'

/**
 * Determines the distribution of each character in ${rawSequence}.
 *
 * @param {String} rawSequence
 * @returns {Object}
 */
exports.distribution = function(rawSequence = '') {
	let distribution = {},
		length = rawSequence.length

	for (let i = 0; i < length; i++) {
		let char = rawSequence[i]
		if (!distribution[char])
			distribution[char] = 1
		else
			++distribution[char]
	}

	return distribution
}

/**
 * @param {String} rawSequence
 * @returns {Number}
 */
exports.gcPercent = function(rawSequence = '') {
	let distribution = exports.distribution(rawSequence),
		length = rawSequence.length,
		numG = (distribution.g || 0) + (distribution.G || 0),
		numC = (distribution.c || 0) + (distribution.C || 0)

	return (numG + numC) / length * 100. // eslint-disable-line no-magic-numbers
}

/**
 * Identifies regions within ${maskedSequence} that consist of 1 or more lower-case 'x's and
 * returns an array of arrays indicating the 1-based start / stop positions of each region.
 *
 * Example:
 * parseMaskedRegions('ATCxxxGxAAT') returns
 * [
 *    [4, 6],
 *    [8, 8]
 * ]
 *
 * An empty array is returned if no regions of 'x's exist.
 *
 * @param {string} maskedSequence sequence containing masked regions as lowercase x's
 * @returns {Array.<Array>} array of ranges that are masked
 */
exports.parseMaskedRegions = function(maskedSequence) {
	let maskedRegions = [],
		firstX = maskedSequence.indexOf('x')

	if (firstX >= 0) {
		let region = [firstX + 1, firstX + 1]
		maskedRegions.push(region)
		for (let i = firstX + 1, z = maskedSequence.length; i < z; i++) {
			if (maskedSequence[i] === 'x') {
				if (region) {
					region[1]++
				}
				else {
					// New region
					region = [i + 1, i + 1]
					maskedRegions.push(region)
				}
				continue
			}

			region = null
		}
	}

	return maskedRegions
}
