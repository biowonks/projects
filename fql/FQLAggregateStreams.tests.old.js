/* eslint-disable no-magic-numbers, no-undefined */
'use strict'
let expect = require('chai').expect

let fs = require('fs'),
	Stream = require('stream'),
	through2 = require('through2'),
	//fqlAggregateStreams = require('./FQLAggregateStreams.js')

let sampleData = require('./test-data/sample-input-fql.json')

describe('FQLStream test suit ::', function() {
	it('has to work using stream', function(done) {
// , {highWaterMark: 3 * 64 }),
		let	writeStream = fs.createWriteStream('./test-data/FQLAggregateStreams.testToday.json'),
			readable = new Stream.Readable({objectMode: true})

		let setsOfRules = [
			[
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
			],
			[
				{
					pos: [
						{
							resource: 'fql',
							feature: '^'
						},
						{
							resource: 'pfam28',
							feature: 'CheW',
							count: '{2,}'
						}
					]
				}
			]
		]

		let fqlStreams = fqlAggregateStreams(setsOfRules)

		readable.pipe(fqlStreams).pipe(writeStream)

		sampleData.forEach((item) => {
			readable.push(item)
		})
		readable.push(null)
	})
})
