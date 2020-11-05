'use strict'

// Core
const fs = require('fs')
const path = require('path')

// Local
const hmmpfamStream = require('./hmmpfam-stream')

describe('streams', function() {
	describe('hmmpfam', function() {
		// eslint-disable-next-line no-mixed-requires
		const hmmDatabaseFile = path.resolve(__dirname, 'test-data', 'hmmer2-ecfs.hmm')
		const fastaFile = path.resolve(__dirname, 'test-data', 'hmmpfam-seqs.faa')
    const numHmmsInECFs = 45
    const numCpus = 0
		const expectedResults = require('./test-data/hmmpfam-results') // eslint-disable-line global-require

		it('(streaming input) throws error if hmm database does not exist', function() {
			expect(function() {
				hmmpfamStream('/path/to/invalid/hmmer2/database')
			}).throw(Error)
		})

		it('(streaming input) predicts domains', function(done) {
			const inStream = fs.createReadStream(fastaFile)
			const hmmpfam = hmmpfamStream(hmmDatabaseFile, numHmmsInECFs, numCpus)
			const results = []

			inStream
			.on('error', done)
			.pipe(hmmpfam)
			.on('error', done)
			.on('data', (result) => {
				results.push(result)
			})
			.on('finish', () => {
				expect(results).eql(expectedResults)
				done()
			})
		})

		it('(file) throws error if hmm database does not exist', function() {
			expect(function() {
				hmmpfamStream.file('/path/to/invalid/hmmer2/database', fastaFile)
			}).throw(Error)
		})

		it('(file) predicts domains', function(done) {
			const hmmpfam = hmmpfamStream.file(hmmDatabaseFile, fastaFile, numHmmsInECFs, numCpus)
			const results = []

			hmmpfam.on('error', done)
			hmmpfam
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
