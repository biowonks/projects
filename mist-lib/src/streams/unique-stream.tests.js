'use strict'

// Local
const Seq = require('../bio/Seq'),
	uniqueStream = require('./unique-stream')

describe('streams', function() {
	describe('unique stream', function() {
		function writeAndExpect(stream, objects, expectedOutput, done) {
			let results = []

			stream.on('error', done)
			.on('data', (obj) => {
				results.push(obj)
			})

			for (let object of objects)
				stream.write(object)

			stream.end(() => {
				expect(results).deep.equal(expectedOutput)
				done()
			})
		}

		it('filters out objects using the default id property', function(done) {
			let obj1 = {id: 1},
				obj2 = {id: 1, fraction: .5}

			writeAndExpect(uniqueStream(), [obj1, obj2], [obj1], done)
		})

		it('filters out objects using the explicit id property', function(done) {
			let obj1 = {id: 1},
				obj2 = {id: 1, fraction: .5}

			writeAndExpect(uniqueStream('id'), [obj1, obj2], [obj1], done)
		})

		it('filters out objects using a non-default property', function(done) {
			let obj1 = {id: 1, alternate_id: 1},
				obj2 = {id: 1, alternate_id: 2, fraction: .5}

			writeAndExpect(uniqueStream('alternate_id'), [obj1, obj2], [obj1, obj2], done)
		})

		it('filters out duplicate sequences using method', function(done) {
			let seq1 = new Seq('ATGC'),
				seq2 = new Seq('atgc'),
				stream = uniqueStream((seq) => seq.seqId())

			writeAndExpect(stream, [seq1, seq2], [seq1], done)
		})
	})
})
