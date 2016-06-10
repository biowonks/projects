/* eslint-disable no-magic-numbers, no-new */

'use strict'

// Core node libraries
let path = require('path')

// Local includes
let SegStream = require('./SegStream')

describe('SegStream', function() {
	it('throws error if no file is supplied to the constructor', function() {
		expect(function() {
			new SegStream()
		}).throw(Error)
	})

	it('runs seg on a fasta file', function(done) {
		let inputFile = path.resolve(__dirname, 'SegStream-test-seqs.faa'),
			segStream = new SegStream(inputFile),
			results = []

		// Any error within coils stream (including spawn problems) should make this test fail
		segStream.on('error', done)

		segStream.on('data', function(result) {
			results.push(result)
		})
		.on('finish', () => {
			expect(results).deep.equal([
				{
					header: 'b0993',
					segs: [
						[18, 25],
						[120, 143],
						[431, 446]
					]
				},
				{
					header: 'b2218',
					segs: [
						[315, 330],
						[452, 472],
						[514, 527]
					]
				},
				{
					header: 'b2370',
					segs: [
						[539, 552],
						[732, 743],
						[872, 884],
						[925, 934],
						[970, 981]
					]
				},
				{
					header: 'b2786',
					segs: [
						[135, 149],
						[633, 647],
						[892, 905]
					]
				},
				{
					header: 'b3210',
					segs: [
						[26, 42],
						[508, 520]
					]
				},
				{
					header: 'b1145',
					segs: []
				}
			])
			done()
		})
	})
})
