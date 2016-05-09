'use strict'

// Core node libraries
let path = require('path')

// Local includes
let HmmscanStream = require('./HmmscanStream')

describe('HmmscanStream', function() {
	it('predicts domains and outputs result', function(done) {
		let hmmDatabaseFile = path.resolve(__dirname, 'test-data', 'test.hmm'),
			fastaFile = path.resolve(__dirname, 'test-data', 'seqs.faa'),
			numHmmsInPfam29 = 16295,
			hmmscanStream = new HmmscanStream(hmmDatabaseFile, fastaFile, numHmmsInPfam29),
			expectedResults = require('./test-data/hmmscan-results'),
			results = []

		hmmscanStream
		.on('data', (result) => {
			results.push(result)
		})
		.on('finish', () => {
			expect(results).deep.equal(expectedResults)
			done()
		})
	})
})
