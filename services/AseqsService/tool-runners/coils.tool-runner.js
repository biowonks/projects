'use strict'

// Core
const assert = require('assert')

// Vendor
const streamEach = require('stream-each'),
	Promise = require('bluebird')

// Local
const coilsStream = require('../../../pipeline/lib/streams/coils-stream')

module.exports = function(aseqs) {
	return new Promise((resolve, reject) => {
		let coils = coilsStream(),
			i = 0

		streamEach(coils, (result, next) => {
			let aseq = aseqs[i]
			assert(aseq.id === result.header)
			aseq.setDataValue('coils', result.coils)
			i++
			next()
		}, (error) => {
			if (error) {
				coils.destroy()
				reject(error)
			}
			else {
				resolve(aseqs)
			}
		})

		Promise.each(aseqs, (aseq) => {
			return coils.writePromise(aseq.toFasta())
		})
		.then(() => coils.end())
	})
}

module.exports.meta = {
	description: 'identify coiled-coils'
}
