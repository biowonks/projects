/* eslint-disable no-magic-numbers, no-new */

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Local
const segStream = require('./seg-stream')

describe('streams', function() {
	describe.only('seg stream', function() {
		it('streaming prediction of segs', function(done) {
			let inputFile = path.resolve(__dirname, 'test-data', 'seqs-with-segs.faa'),
				inStream = fs.createReadStream(inputFile),
				seg = segStream(inputFile),
				results = []

			// Any error within seg stream (including spawn problems) should make this test fail
			seg.on('error', done)
			inStream.on('error', done)

			inStream.pipe(seg)
			.on('data', function(result) {
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
})
