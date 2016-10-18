'use strict'

let NdJsonReaderStream = require('./NdJsonReaderStream')

describe('NdJsonReaderStream', function() {
	it('parses newline delimited data', function() {
		let reader = new NdJsonReaderStream(),
			results = []

		reader.on('data', function(data) {
			results.push(data)
		})

		reader.write('{"name": "Luke"}\n')
		reader.write('{"name": "Igor"}\n')
		reader.end()

		expect(results).deep.equal([
			{name: 'Luke'},
			{name: 'Igor'}
		])
	})
})
