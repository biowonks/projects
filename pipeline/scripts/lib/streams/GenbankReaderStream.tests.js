/* eslint-disable no-undefined, no-magic-numbers, no-unused-expressions */

'use strict'

// Vendor
let Promise = require('bluebird')

// Local
let GenbankReaderStream = require('./GenbankReaderStream'),
	StringStream = require('./StringStream')

/**
 * Promisifies the stream parsing of GenBank input strings.
 *
 * @param {string} input string containing the example GenBank data to parse
 * @returns {Promise} future resolving with parsed results or rejecting with error
 */
function parse(input) {
	return new Promise((resolve, reject) => {
		let genbankReaderStream = new GenbankReaderStream(),
			stringStream = new StringStream(input),
			results = []

		stringStream
		.pipe(genbankReaderStream)
		.on('error', reject)
		.on('data', (genBank) => {
			results.push(genBank)
		})
		.on('finish', () => {
			resolve(results)
		})
	})
}

/**
 * Convenience function for checking that parsing ${input} emits an error.
 *
 * @param {string} input string containing the example GenBank data to parse
 * @returns {Promise} future resolving with parsed results or rejecting with error
 */
function parseThrowsError(input) {
	let succeeded = null
	return parse(input)
	.then(() => {
		succeeded = true
	})
	.catch(() => {
		succeeded = false
	})
	.finally(() => {
		expect(succeeded).false
	})
}

/**
 * @param {string} input GenBank data string
 * @returns {string} input suffixed with a newline and the GenBank record terminator
 */
function closeInput(input) {
	return input + '\n//'
}

/**
 * Functions the same as parse however, returns the first result in the parsed set.
 *
 * @param {string} input string containing the example GenBank data to parse
 * @returns {Promise} future resolving with parsed results or rejecting with error
 */
function parseSingle(input) {
	return parse(input)
	.then((results) => {
		expect(results.length).equal(1)
		return results[0]
	})
}

describe('Streams', function() {
	describe.only('GenBankReaderStream', function() {
		it('empty input does not return any records', function() {
			return parse('')
			.then((results) => {
				expect(results.length).equal(0)
			})
		})

		it('// returns blank entry', function() {
			return parseSingle('//')
			.then((result) => {
				expect(result).a('object')
				expect(result.locus).null
			})
		})

		it('multiple record separators returns right number of genbank records', function() {
			return parse('//\n//')
			.then((results) => {
				expect(results.length).equal(2)
			})
		})

		it('no record terminator // emits error', function() {
			return parseThrowsError('LOCUS       NC_019563            1494183 bp    DNA     circular CON 30-JUL-2015')
		})

		describe('LOCUS', function() {
			for (let i = 0; i <= 10; i++) {
				if (i === 7)
					continue

				it(`emits error with ${i} space separated values`, function() {
					let input = 'LOCUS       ' + ('x'.repeat(i)
						.split('')
						.join(' '))

					return parseThrowsError(closeInput(input))
				})
			}

			it('values without strandedness', function() {
				return parseSingle(closeInput('LOCUS       NC_019563            1494183 bp    DNA     circular CON 30-JUL-2015'))
				.then((result) => {
					expect(result.locus).deep.equal({
						name: 'NC_019563',
						bp: 1494183,
						moleculeType: 'DNA',
						topology: 'circular',
						divisionCode: 'CON',
						date: '30-JUL-2015'
					})
				})
			})

			it('values with strandedness', function() {
				return parseSingle(closeInput('LOCUS       NC_019563            1494183 bp  ss-rRNA     linear   CON 30-JUL-2015'))
				.then((result) => {
					expect(result.locus).deep.equal({
						name: 'NC_019563',
						bp: 1494183,
						moleculeType: 'ss-rRNA',
						topology: 'linear',
						divisionCode: 'CON',
						date: '30-JUL-2015'
					})
				})
			})

			it('multiple LOCUS lines emits error', function() {
				return parseThrowsError(closeInput('LOCUS       NC_019563            1494183 bp    DNA     circular CON 30-JUL-2015\n' +
					'LOCUS       NC_019563            1494183 bp    DNA     circular CON 30-JUL-2015'))
			})
		}) // LOCUS

		describe('DEFINITION', function() {
			it('emits error with empty definition', function() {
				return parseThrowsError(closeInput('DEFINITION  '))
			})

			it('emits error without terminal period', function() {
				return parseThrowsError(closeInput('DEFINITION  Escherichia coli'))
			})

			it('period works', function() {
				return parseSingle(closeInput('DEFINITION  .'))
				.then((result) => {
					expect(result.definition).equals('.')
				})
			})

			it('prefixed spaces are removed', function() {
				return parseSingle(closeInput('DEFINITION   .'))
				.then((result) => {
					expect(result.definition).equals('.')
				})
			})
		})
	})
})
