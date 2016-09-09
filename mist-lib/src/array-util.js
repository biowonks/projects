'use strict'

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {Array} elements in ${a} that are not in ${b}
 */
exports.difference = function(a, b) {
	let bSet = new Set(b)
	return a.filter((x) => !bSet.has(x))
}
