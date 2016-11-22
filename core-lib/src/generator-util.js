'use strict'

/**
 * @param {Array.<any>} array
 * @param {Number} size - maximum number of elements to yield
 * @yields {Array.<any>}
 */
exports.batch = function *(array, size) {
	if (!size || size < 0)
		return

	let i = 0
	while (i < array.length) {
		let slice = array.slice(i, i + size)
		i += size
		yield slice
	}
}
