'use strict'

// Vendor
const through2 = require('through2')

/**
 *  Defaults to the toString() method of each object if no serialize function is provided.
 *
 * @param {Function?|Object?} options
 * @param {Function?} serializeFn
 * @returns {Stream}
 */
function serializeStream(options, serializeFn) {
	let streamOptions = options,
		serialize = serializeFn

	if (typeof options === 'function') {
		streamOptions = null
		serialize = options
	}

	return through2.obj(streamOptions, (object, encoding, done) => {
		let result = null
		try {
			result = serialize ? serialize(object, encoding) : object.toString(encoding)
			if (typeof result !== 'string')
				throw new Error('Serialization of object did not return a string')
		}
		catch (error) {
			done(error)
			return
		}

		done(null, result)
	})
}

function ndjson(object) {
	return JSON.stringify(object) + '\n'
}

module.exports = serializeStream
module.exports.ndjson = function(options) {
	return serializeStream(options, ndjson)
}
