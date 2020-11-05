'use strict'

// Core
const fs = require('fs')
const path = require('path')

// Local
const tmhmm2Stream = require('./tmhmm2-stream')

describe.skip('tmhmm2', function() {
	// eslint-disable-next-line no-mixed-requires
	let fastaFile = path.resolve(__dirname, 'test-data', 'tmhmm2-seqs.faa'),
		expectedResults = require('./test-data/tmhmm2-results') // eslint-disable-line global-require

	it('(streaming input) predicts domains', function(done) {
		let inStream = fs.createReadStream(fastaFile),
			tmhmm2 = tmhmm2Stream(),
			results = []

		inStream
		.on('error', done)
		.pipe(tmhmm2)
		.on('error', done)
		.on('data', (result) => {
			results.push(result)
		})
		.on('finish', () => {
			expect(results).deep.equal(expectedResults)
			done()
		})
	})
})
