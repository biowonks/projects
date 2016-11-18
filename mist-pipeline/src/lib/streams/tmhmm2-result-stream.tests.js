/* eslint-disable no-magic-numbers, global-require */
'use strict'

// Core
const path = require('path'),
	fs = require('fs')

// Local
const tmhmm2ResultStream = require('./tmhmm2-result-stream')

describe('streams', function() {
	describe('tmhmm2 result stream', function() {
		it('parses hmmscan results', function(done) {
			// eslint-disable-next-line no-mixed-requires
			let inputFile = path.resolve(__dirname, 'test-data', 'tmhmm2-results.txt'),
				inStream = fs.createReadStream(inputFile, {highWaterMark: 1024}),
				expectedResults = require('./test-data/tmhmm2-results'),
				tmhmm2ResultReader = tmhmm2ResultStream(),
				results = []

			inStream
			.pipe(tmhmm2ResultReader)
			.on('data', (result) => {
				results.push(result)
			})
			.on('finish', () => {
				expect(results).eql(expectedResults)
				done()
			})
		})
	})
})
