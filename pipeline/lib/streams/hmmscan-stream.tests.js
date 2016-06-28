'use strict'

// Core
const path = require('path')

// Local
const hmmscanStream = require('./hmmscan-stream')

describe('streams', function() {
	describe('hmmscan stream', function() {
		it('predicts domains and outputs result', function(done) {
			// eslint-disable-next-line no-mixed-requires
			let hmmDatabaseFile = path.resolve(__dirname, 'test-data', 'test.hmm'),
				fastaFile = path.resolve(__dirname, 'test-data', 'hmmscan-seqs.faa'),
				numHmmsInPfam29 = 16295,
				hmmscan = hmmscanStream(hmmDatabaseFile, fastaFile, numHmmsInPfam29),
				expectedResults = require('./test-data/hmmscan-results'), // eslint-disable-line global-require
				results = []

			hmmscan.on('error', done)
			hmmscan
			.on('data', (result) => {
				results.push(result)
			})
			.on('finish', () => {
				expect(results).deep.equal(expectedResults)
				done()
			})
		})
	})
})
