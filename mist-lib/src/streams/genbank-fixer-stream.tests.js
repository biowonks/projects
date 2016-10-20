/* eslint-disable no-magic-numbers */

'use strict'

// Vendor
const Promise = require('bluebird')

// Local
const genbankFixerStream = require('./genbank-fixer-stream'),
	memoryStream = require('./memory-stream')

/**
 * Promisifies the stream parsing of GenBank input strings.
 *
 * @param {string} input string containing the example GenBank data to parse
 * @returns {Promise} future resolving with parsed results or rejecting with error
 */
function parse(input) {
	return new Promise((resolve, reject) => {
		let genbankFixerReader = genbankFixerStream(),
			inputReader = memoryStream(input),
			results = []

		inputReader
		.pipe(genbankFixerReader)
		.on('error', reject)
		.on('data', (line) => {
			results.push(line)
		})
		.on('finish', () => {
			resolve(results)
		})
	})
}

describe('streams', function() {
	describe('genbank fixer stream', function() {
		it('fixes improperly terminated product value', function() {
			let inputLines = [
				'                     /product="crotonobetainyl-CoA--carnitine CoA-transferase',
				'                     /alpha-methylacyl-CoA racemase 1"'
			]

			return parse(inputLines.join('\n'))
			.then((results) => {
				expect(results.length).equal(2)
				expect(results[0]).equal(inputLines[0] + '\n')
				expect(results[1]).equal('                     alpha-methylacyl-CoA racemase 1"')
			})
		})

		it('fixes improperly terminated function value', function() {
			let inputLines = [
				'                     /function="Phosphatidylserine/phosphatidylglycerophosphate',
				'                     /cardiolipin synthases and related enzymes"'
			]

			return parse(inputLines.join('\n'))
			.then((results) => {
				expect(results.length).equal(2)
				expect(results[0]).equal(inputLines[0] + '\n')
				expect(results[1]).equal('                     cardiolipin synthases and related enzymes"')
			})
		})

		it('fixes improperly terminated product value that continues with space after /', function() {
			let inputLines = [
				'                     /product="electron-transferring-flavoprotein dehydrogenase',
				'                     / geranylgeranyl hydrogenase-like protein"'
			]

			return parse(inputLines.join('\n'))
			.then((results) => {
				expect(results.length).equal(2)
				expect(results[0]).equal(inputLines[0] + '\n')
				expect(results[1]).equal('                     geranylgeranyl hydrogenase-like protein"')
			})
		})
	})
})
