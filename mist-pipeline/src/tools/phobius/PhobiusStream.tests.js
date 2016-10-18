/* eslint-disable no-magic-numbers */
'use strict'

// Core
let fs = require('fs'),
	path = require('path')

// Local
let PhobiusStream = require('./PhobiusStream')

describe.skip('PhobiusStream', function() {
	it('streaming prediction of TM', function(done) {
		let inputFile = path.resolve(__dirname, 'test.fa'),
			inStream = fs.createReadStream(inputFile),
			phobiusStream = new PhobiusStream(),
			results = []

		inStream.pipe(phobiusStream)
		.on('data', (result) => {
			results.push(result)
		})
		.on('finish', () => {
			expect(results).deep.equal([
				{
					header: '5H2A_CRIGR',
					sp: null,
					tms: [
						[76, 99],
						[111, 139],
						[151, 171],
						[192, 214],
						[234, 256],
						[324, 348],
						[360, 383]
					]
				},
				{
					header: 'YkuI_C',
					sp: null,
					tms: []
				},
				{
					header: '2CSK_N',
					sp: {
						stop: 37,
						N: [1, 7],
						H: [8, 19],
						C: [20, 37]
					},
					tms: [
						[155, 178]
					]
				}
			])
			done()
		})
	})
})
