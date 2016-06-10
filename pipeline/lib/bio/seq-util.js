'use strict'

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
