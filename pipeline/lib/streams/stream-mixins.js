'use strict'

// Vendor
const Promise = require('bluebird')

exports.writePromise = function(stream) {
	stream.writePromise = function(chunk, encoding, callback) {
		return new Promise((resolve) => {
			if (this.write(chunk, encoding, callback))
				resolve()
			else
				this.once('drain', resolve)
		})
	}
}

exports.endPromise = function(stream) {
	stream.endPromise = Promise.promisify(stream.end)
}
