/* eslint-disable no-magic-numbers, no-undefined */
'use strict'
let expect = require('chai').expect

let fs = require('fs'),
	Stream = require('stream'),
	FQLStream = require('./FQLStream.js')

describe('FQLStream test suit ::', function() {
	it('has to work using stream', function() {
		let sampleData = require('./test-data/sample-input-fql.json'), // , {highWaterMark: 3 * 64 }),
			writeStream = fs.createWriteStream('./test-data/seqDepotInfo.filtered.testToday.json'),
			readable = new Stream.Readable({objectMode: true})

		let setOfRules = [
			{
				pos: [
					{
						resource: 'pfam28',
						feature: 'CheW',
						count: '{2,3}'
					},
					{
						resource: 'fql',
						feature: '$'
					}
				]
			}
		]

		let expected = [
			true, // CheW | CheW
			false, // CheW | Response_reg
			false, // CheW
			false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
			true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
			false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
			true, // CheW | CheW | CheW
			false, // Response_reg | NMT1_2 | CheW
			false, // CheW | CheR
			false, // Response_reg | CheW
			false, // TM | Cache_1 | TM | HAMP | MCPsignal
			false, // HAMP | MCPsignal
			false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
			false, // **
			false, // **
			false, // TM | TM | MCPsignal
			false, // TM | MCPsignal | Rhodanese
			false, // TM | TM | TM | TM | MCPsignal
			false, // TM | TM | TM | TM | TM | TM | MCPsignal
			false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
			false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
			false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
			false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
		]

		let fqlStream = new FQLStream(setOfRules, 0, false)

		readable.pipe(fqlStream).pipe(writeStream)

		sampleData.forEach((item) => {
			readable.push(item)
		})
		readable.push(null)
	})
})
