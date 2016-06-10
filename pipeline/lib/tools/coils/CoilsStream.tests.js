/* eslint-disable no-magic-numbers */

'use strict'

let fs = require('fs'),
	path = require('path')

let CoilsStream = require('./CoilsStream')

describe('CoilsStream', function() {
	it('streaming prediction of coils', function(done) {
		let inputFile = path.resolve(__dirname, 'seqs-with-coiled-coils.faa'),
			inStream = fs.createReadStream(inputFile),
			coilsStream = new CoilsStream(),
			results = []

		// Any error within coils stream (including spawn problems) should make this test fail
		coilsStream.on('error', done)

		inStream.pipe(coilsStream)
		.on('data', (result) => {
			results.push(result)
		})
		.on('finish', () => {
			expect(results).deep.equal([
				{
					header: 'b0993',
					coils: [
						[130, 150],
						[222, 242],
						[409, 443]
					]
				},
				{
					header: 'b2218',
					coils: [
						[449, 469]
					]
				},
				{
					header: 'b2370',
					coils: []
				},
				{
					header: 'b2786',
					coils: [
						[251, 289]
					]
				},
				{
					header: 'b3210',
					coils: [
						[77, 132]
					]
				}
			])
			done()
		})
	})
})
