'use strict'

// Local
const Seq = require('../bio/Seq'),
	uniqueSeqStream = require('./unique-seq-stream')

describe('streams', function() {
	describe('unique seq stream', function() {
		it('filters out duplicate sequences', function(done) {
			let seq1 = new Seq('ATGC'),
				seq2 = new Seq('atgc'),
				x = uniqueSeqStream(),
				results = []

			x.on('error', done)
			.on('data', (seq) => {
				results.push(seq)
			})

			x.write(seq1)
			x.write(seq2)
			x.end(() => {
				expect(results).deep.equal([seq1])
				done()
			})
		})
	})
})
