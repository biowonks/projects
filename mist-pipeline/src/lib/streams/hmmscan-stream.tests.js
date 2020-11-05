'use strict'

// Core
const fs = require('fs')
const path = require('path')

// Local
const hmmscanStream = require('./hmmscan-stream')

describe('streams', function() {
  describe('hmmscan', function() {
    // eslint-disable-next-line no-mixed-requires
    const hmmDatabaseFile = path.resolve(__dirname, 'test-data', 'test.hmm')
    const fastaFile = path.resolve(__dirname, 'test-data', 'hmmscan-seqs.faa')
    const numHmmsInPfam29 = 16295
    const expectedResults = require('./test-data/hmmscan-results') // eslint-disable-line global-require

    it('(streaming input) throws error if hmm database does not exist', function() {
      expect(function() {
        hmmscanStream('/path/to/invalid/hmmer3/database')
      }).throw(Error)
    })

    it('(streaming input) predicts domains', function(done) {
      const inStream = fs.createReadStream(fastaFile)
      const hmmscan = hmmscanStream(hmmDatabaseFile, ['--noali', '--cut_ga', '-Z', numHmmsInPfam29])
      const results = []

      inStream
        .on('error', done)
        .pipe(hmmscan)
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
        hmmscanStream.file('/path/to/invalid/hmmer2/database', fastaFile, ['--noali', '--cut_ga', '-Z', numHmmsInPfam29])
      }).throw(Error)
    })

    it('(file) predicts domains', function(done) {
      const hmmscan = hmmscanStream.file(hmmDatabaseFile, fastaFile, ['--noali', '--cut_ga', '-Z', numHmmsInPfam29])
      const results = []

      hmmscan.on('error', done)
      hmmscan
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
