'use strict'

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {Array} - elements in ${a} that are not in ${b}
 */
exports.difference = (a, b) => {
	let bSet = new Set(b)
	return a.filter((x) => !bSet.has(x))
}

/**
 * @param {Array} array
 * @returns {Array} - one-dimensional array of all individual elements in ${array}
 */
exports.flatten = (array) => array.reduce((a, b) => {
	return a.concat(Array.isArray(b) ? exports.flatten(b) : b)
}, [])
