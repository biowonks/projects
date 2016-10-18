'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Local
const hmmscanStream = require('./hmmscan-stream')

describe('streams', function() {
	describe('hmmscan', function() {
		// eslint-disable-next-line no-mixed-requires
		let hmmDatabaseFile = path.resolve(__dirname, 'test-data', 'test.hmm'),
			fastaFile = path.resolve(__dirname, 'test-data', 'hmmscan-seqs.faa'),
			numHmmsInPfam29 = 16295,
			expectedResults = require('./test-data/hmmscan-results') // eslint-disable-line global-require

		it('(streaming input) predicts domains', function(done) {
			let inStream = fs.createReadStream(fastaFile),
				hmmscan = hmmscanStream(hmmDatabaseFile, numHmmsInPfam29),
				results = []

			inStream.pipe(hmmscan)
			.on('error', done)
			.on('data', (result) => {
				results.push(result)
			})
			.on('finish', () => {
				expect(results).deep.equal(expectedResults)
				done()
			})
		})

		it('(file) predicts domains', function(done) {
			let hmmscan = hmmscanStream.file(hmmDatabaseFile, fastaFile, numHmmsInPfam29),
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
