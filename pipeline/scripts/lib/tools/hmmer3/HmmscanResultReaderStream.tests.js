'use strict'

// Core node libraries
let path = require('path'),
	fs = require('fs')

// Local includes
let HmmscanResultReaderStream = require('./HmmscanResultReaderStream')

describe('HmmscanResultReaderStream', function() {
	it('parses hmmscan results', function(done) {
		// eslint-disable-next-line no-mixed-requires
		let inputFile = path.resolve(__dirname, 'test-data/hmmscan-results.txt'),
			inStream = fs.createReadStream(inputFile, {highWaterMark: 1024}),
			hmmscanResultReaderStream = new HmmscanResultReaderStream(),
			expectedResults = require('./test-data/hmmscan-results'), // eslint-disable-line global-require
			results = []

		inStream
			.pipe(hmmscanResultReaderStream)
			.on('data', (result) => {
				results.push(result)
			})
			.on('finish', () => {
				expect(results).deep.equal(expectedResults)
				done()
			})
	})
})
