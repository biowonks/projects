'use strict'

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {Array} - elements in ${a} that are not in ${b}
 */
exports.difference = (a, b) => {
	const bSet = new Set(b)
	return a.filter((x) => !bSet.has(x))
}

/**
 * @param {Array} array
 * @returns {Array} - one-dimensional array of all individual elements in ${array}
 */
exports.flatten = (array) => array.reduce((a, b) => {
	return a.concat(Array.isArray(b) ? exports.flatten(b) : b)
}, [])

/**
 * @param {Array.<Object>} arrayOfObjects
 * @param {string} [key = 'id']
 * @returns {Object} objects indexed by ${key} field of each object
 */
exports.indexObjects = (arrayOfObjects, key = 'id') => arrayOfObjects.reduce(
	(result, object) => {
		result[object[key]] = object
		return result
	},
	{}
)

/**
 * @param {Array.<Object>} arrayOfObjects
 * @param {Array.<number|string>} orderedValues
 * @param {string} [key = 'id']
 * @returns {Array.<Object>} ${arrayOfObjects} in the order of ${orderedValues} where each value of orderedValues corresponds to the key value of each object in arrayOfObjects
 */
exports.sortBy = (arrayOfObjects, orderedValues, key = 'id') => {
	const objectsByKey = exports.indexObjects(arrayOfObjects, key)
	return orderedValues.map((value) => objectsByKey[value])
}
