'use strict'

// Vendor
const streamEach = require('stream-each'),
	Promise = require('bluebird')

// Local
const hmmscanStream = require('../../../pipeline/lib/streams/hmmscan-stream')

/**
 * Updates each ${aseqs} with the results of running the hmmscan against the Pfam 30 HMM database.
 *
 * @param {Array.<Aseq>} aseqs
 * @param {Object} pfamConfig
 * @param {String} pfamConfig.databasePath - path to pfam 30 hmm database file
 * @param {Number} [pfamConfig.z]
 * @returns {Promise.<Array.<Aseq>>}
 */
module.exports = function(aseqs, pfamConfig) {
	// If nothing is written to the STDIN of hmmscan, it causes an error. Thus, we handle empty
	// input specially here.
	if (!aseqs.length)
		return Promise.resolve([])

	return new Promise((resolve, reject) => {
		let hmmscan = hmmscanStream(pfamConfig.databasePath, pfamConfig.z),
			i = 0

		streamEach(hmmscan, (result, next) => {
			let aseq = aseqs[i]
			aseq.pfam30 = result.domains
			i++
			next()
		}, (error) => {
			if (error) {
				hmmscan.destroy()
				reject(error)
			}
			else {
				resolve(aseqs)
			}
		})

		Promise.each(aseqs, (aseq) => {
			return hmmscan.writePromise(aseq.toFasta())
		})
		.then(() => hmmscan.end())
	})
}

module.exports.meta = {
	description: 'predict pfam30 domains'
}
