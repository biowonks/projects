'use strict'

// Core
const assert = require('assert')

// Vendor
const streamEach = require('stream-each'),
	Promise = require('bluebird')

// Local
const segStream = require('../../../pipeline/lib/streams/seg-stream')

/**
 * Updates each ${aseqs} ${targetField} with the results of running the seg tool.
 *
 * @param {Array.<Aseq>} aseqs
 * @returns {Promise.<Array.<Aseq>>}
 */
module.exports = function(aseqs) {
	return new Promise((resolve, reject) => {
		let seg = segStream(),
			i = 0

		streamEach(seg, (result, next) => {
			let aseq = aseqs[i]
			assert(aseq.id === result.header)
			aseq.segs = result.segs
			i++
			next()
		}, (error) => {
			if (error) {
				seg.destroy()
				reject(error)
			}
			else {
				resolve(aseqs)
			}
		})

		Promise.each(aseqs, (aseq) => {
			return seg.writePromise(aseq.toFasta())
		})
		.then(() => seg.end())
	})
}

module.exports.meta = {
	description: 'identify low-complexity segments'
}
