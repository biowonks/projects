'use strict'

let FQLStream = require('./FQLStream.js'),
	Transform = require('stream').Transform,
	pumpify = require('pumpify')

const numItemsPerChunk = 10

module.exports = function(setsOfRules, numItems = numItemsPerChunk) {
	let streams = []
	for (let i = 0; i < setsOfRules.length; i++) {
		let objectMode = (i === setsOfRules.length - 1)
		let fqlStream = new FQLStream(setsOfRules[i], i, false, numItems)
		streams.push(fqlStream)
	}

	return pumpify.obj(streams)
}
