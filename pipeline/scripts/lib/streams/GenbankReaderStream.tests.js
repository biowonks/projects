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

		// ------------------------------------------------
		// ------------------------------------------------
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

			it('emits error if value spread across multiple lines', function() {
				return parseThrowsError(closeInput('LOCUS       NC_019563            1494183 bp    DNA     circular CON 30-JUL-2015\n' +
					'            NC_019563            1494183 bp    DNA     circular CON 30-JUL-2015'))
			})
		}) // LOCUS

		// ------------------------------------------------
		// ------------------------------------------------
		describe('DEFINITION', function() {
			it('emits error with empty value', function() {
				return parseThrowsError(closeInput('DEFINITION  '))
			})

			it('emits error without terminal period', function() {
				return parseThrowsError(closeInput('DEFINITION  Escherichia coli'))
			})

			it('period', function() {
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

			it('normal definition', function() {
				return parseSingle(closeInput('DEFINITION  complete genome.'))
				.then((result) => {
					expect(result.definition).equals('complete genome.')
				})
			})

			it('multi-line definition', function() {
				return parseSingle(closeInput('DEFINITION  Line 1\n            Line 2.'))
				.then((result) => {
					expect(result.definition).equals('Line 1 Line 2.')
				})
			})

			it('multiple DEFINITION emits error', function() {
				let input = 'DEFINITION  plasmid.\n' +
					'DEFINITION  chromosome'
				return parseThrowsError(closeInput(input))
			})
		}) // DEFINITION

		// ------------------------------------------------
		// ------------------------------------------------
		describe('ACCESSION', function() {
			it('emits error with empty value', function() {
				return parseThrowsError(closeInput('ACCESSION   '))
			})

			it('emits error with spaces', function() {
				return parseThrowsError(closeInput('ACCESSION     '))
			})

			it('only primary accession', function() {
				return parseSingle(closeInput('ACCESSION   NC_019565'))
				.then((result) => {
					expect(result.accession).deep.equal({
						primary: 'NC_019565',
						secondary: null
					})
				})
			})

			it('single secondary accession', function() {
				return parseSingle(closeInput('ACCESSION   NC_019565 CP_123456'))
				.then((result) => {
					expect(result.accession).deep.equal({
						primary: 'NC_019565',
						secondary: ['CP_123456']
					})
				})
			})

			it('multi-line secondary accessions with range and multiple separating spaces', function() {
				return parseSingle(closeInput('ACCESSION   NC_019565 CP_123456\n' +
					'            AB_987654-CD_321098   EF76'))
				.then((result) => {
					expect(result.accession).deep.equal({
						primary: 'NC_019565',
						secondary: [
							'CP_123456',
							'AB_987654-CD_321098',
							'EF76'
						]
					})
				})
			})

			it('multiple ACCESSION sections emits error', function() {
				let input = 'ACCESSION   NC_019565\n' +
					'ACCESSION   NC_019566'
				return parseThrowsError(closeInput(input))
			})
		}) // ACCESSION

		// ------------------------------------------------
		// ------------------------------------------------
		// VERSION
		describe('VERSION', function() {
			let invalidVersions = [
				'',
				'  ',
				'AF181452',
				'AF181452.',
				'.',
				'.1',
				'AF181452.0'
			]
			invalidVersions.forEach((invalidVersion) => {
				it(`emits error with invalid primary accession value: ${invalidVersion}`, function() {
					return parseThrowsError(closeInput(`VERSION     ${invalidVersion}`))
				})
			})

			it('valid primary accession', function() {
				return parseSingle(closeInput('VERSION     NC_019565.1'))
				.then((result) => {
					expect(result.version).equal('NC_019565.1')
				})
			})

			it('ignores everything beyond the primary accession', function() {
				return parseSingle(closeInput('VERSION     NC_019565.1  GI:123456'))
				.then((result) => {
					expect(result.version).equal('NC_019565.1')
				})
			})

			it('emits error if value spread across multiple lines', function() {
				return parseThrowsError(closeInput('VERSION     NC_019565.1\n' +
					'            NC_019565.1'))
			})

			it('multiple VERSION sections emits error', function() {
				let input = 'VERSION     NC_019565.1\n' +
					'VERSION     NC_019565.2'
				return parseThrowsError(closeInput(input))
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// DBLINK
		describe('DBLINK', function() {
			let invalidDbLinks = [
				'',
				'  ',
				':',
				'BioProject',
				'BioProject:',
				':12345',
				':12345,23435',
				'BioProject :12345',
				'BioProject:12345 ,',
				'BioProject:12345,'
			]
			invalidDbLinks.forEach((invalidDbLink) => {
				it(`emits error with invalid dblink value: ${invalidDbLink}`, function() {
					return parseThrowsError(closeInput(`DBLINK      ${invalidDbLink}`))
				})
			})

			it('single resource and identifier', function() {
				return parseSingle(closeInput('DBLINK      BioProject:12345'))
				.then((result) => {
					expect(result.dbLink).deep.equal({
						BioProject: [
							12345
						]
					})
				})
			})

			it('single resource with space before identifier', function() {
				return parseSingle(closeInput('DBLINK      BioProject: 12345'))
				.then((result) => {
					expect(result.dbLink).deep.equal({
						BioProject: [
							12345
						]
					})
				})
			})

			it('single resource and multiple identifiers', function() {
				return parseSingle(closeInput('DBLINK      BioProject:12345,AB12345'))
				.then((result) => {
					expect(result.dbLink).deep.equal({
						BioProject: [
							12345,
							'AB12345'
						]
					})
				})
			})

			it('multiple resources', function() {
				return parseSingle(closeInput('DBLINK      BioProject:12345,AB12345\n' +
					'            Assembly:GCF_000317875.1'))
				.then((result) => {
					expect(result.dbLink).deep.equal({
						BioProject: [
							12345,
							'AB12345'
						],
						Assembly: [
							'GCF_000317875.1'
						]
					})
				})
			})

			it('colon on continuation line throws error', function() {
				return parseThrowsError(closeInput('DBLINK      BioProject:1234\n' +
					'            12345,Sample:AB1234'))
			})

			let commaLines = [
				'DBLINK      BioProject:1234\n' +
					'            567',
				'DBLINK      BioProject:1234,\n' +
					'            567',
				'DBLINK      BioProject:1234\n' +
					'            ,567',
				'DBLINK      BioProject:1234,\n' +
					'            ,567'
			]
			commaLines.forEach((commaLine, i) => {
				it(`multiline identifiers comma variant ${i + 1}`, function() {
					return parseSingle(closeInput(commaLine))
					.then((result) => {
						expect(result.dbLink).deep.equal({
							BioProject: [
								1234,
								567
							]
						})
					})
				})
			})

			it('multiple resources with one spanning multiple lines', function() {
				let input = 'DBLINK      BioProject:AB1234.5\n' +
					'            12345\n' +
					'            Assembly:GCF_000317875.1'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.dbLink).deep.equal({
						BioProject: [
							'AB1234.5',
							12345
						],
						Assembly: [
							'GCF_000317875.1'
						]
					})
				})
			})

			it('resource name with space', function() {
				let input = 'DBLINK      Trace Assembly Archive:AB1234.5'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.dbLink).deep.equal({
						'Trace Assembly Archive': [
							'AB1234.5'
						]
					})
				})
			})

			it('multiple DBLINK sections emits error', function() {
				let input = 'DBLINK      resource:123\n' +
					'DBLINK      resource2:345'
				return parseThrowsError(closeInput(input))
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// KEYWORDS
		describe('KEYWORDS', function() {
			it('emits error if missing terminal period', function() {
				return parseThrowsError(closeInput('KEYWORDS    chemoreceptor'))
			})

			it('multiple KEYWORDS sections emits error', function() {
				let input = 'KEYWORDS    chemoreceptor.\n' +
					'KEYWORDS    chemotaxis.'
				return parseThrowsError(closeInput(input))
			})

			it('ignores empty values', function() {
				let input = 'KEYWORDS    ;.'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.keywords).deep.equal([])
				})
			})

			it('trims superfluous spaces around single entry', function() {
				let input = 'KEYWORDS     chemoreceptor .'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.keywords).deep.equal([
						'chemoreceptor'
					])
				})
			})

			it('trims superfluous spaces around middle entry', function() {
				let input = 'KEYWORDS    chemoreceptor; transducer ; trg gene.'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.keywords).deep.equal([
						'chemoreceptor',
						'transducer',
						'trg gene'
					])
				})
			})

			it('isolated period', function() {
				return parseSingle(closeInput('KEYWORDS    .'))
				.then((result) => {
					expect(result.keywords).deep.equal([])
				})
			})

			it('multiple lines with periods', function() {
				let input = 'KEYWORDS    chemoreceptor; transducer ; trg gene.\n' +
					'            membrane protein.'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.keywords).deep.equal([
						'chemoreceptor',
						'transducer',
						'trg gene',
						'membrane protein'
					])
				})
			})

			it('removes duplicates', function() {
				let input = 'KEYWORDS    chemoreceptor; transducer ; chemoreceptor.'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.keywords).deep.equal([
						'chemoreceptor',
						'transducer'
					])
				})
			})

			it('multi line keywords', function() {
				let input = 'KEYWORDS    chemoreceptor; chemotaxis; galactose binding protein; membrane \n' +
					'            protein; transducer; trg gene.'

				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.keywords).deep.equal([
						'chemoreceptor',
						'chemotaxis',
						'galactose binding protein',
						'membrane protein',
						'transducer',
						'trg gene'
					])
				})
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// SEGMENT
		describe('SEGMENT', function() {
			it('emits error if empty value', function() {
				return parseThrowsError(closeInput('SEGMENT     '))
			})

			it('emits error if invalid format', function() {
				return parseThrowsError(closeInput('SEGMENT     1 of three'))
			})

			it('emits error if invalid format', function() {
				return parseThrowsError(closeInput('SEGMENT     one of 3'))
			})

			it('correct format', function() {
				return parseSingle(closeInput('SEGMENT     1 of 3'))
				.then((result) => {
					expect(result.segment).deep.equal({
						number: 1,
						total: 3
					})
				})
			})

			it('multiple SEGMENT sections emits error', function() {
				let input = 'SEGMENT     1 of 3\n' +
					'SEGMENT     2 of 3'
				return parseThrowsError(closeInput(input))
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// SOURCE
		describe('SOURCE', function() {

		})

		// ------------------------------------------------
		// ------------------------------------------------
		describe('composite records', function() {
			it('composite #1', function() {
				return parseSingle(closeInput('LOCUS       NC_019565               1634 bp    DNA     circular CON 30-JUL-2015\n' +
					'DEFINITION  Helicobacter pylori Aklavik86 plasmid p2HPAKL86, complete sequence.\n' +
					'ACCESSION   NC_019565\n' +
					'VERSION     NC_019565.1  GI:425791567\n' +
					'DBLINK      BioProject: PRJNA224116\n' +
					'            Assembly: GCF_000317875.1\n' +
					'            BioSample: SAMN02604324\n' +
					'KEYWORDS    chemoreceptor; chemotaxis; galactose binding protein; membrane \n' +
					'            protein; transducer; trg gene.\n' +
					'SEGMENT     2 of 4')
				)
				.then((result) => {
					expect(result.locus).deep.equal({
						name: 'NC_019565',
						bp: 1634,
						moleculeType: 'DNA',
						topology: 'circular',
						divisionCode: 'CON',
						date: '30-JUL-2015'
					})

					expect(result.definition).equal('Helicobacter pylori Aklavik86 plasmid p2HPAKL86, complete sequence.')

					expect(result.accession).deep.equal({
						primary: 'NC_019565',
						secondary: null
					})

					expect(result.version).equal('NC_019565.1')

					expect(result.dbLink).deep.equal({
						BioProject: [
							'PRJNA224116'
						],
						Assembly: [
							'GCF_000317875.1'
						],
						BioSample: [
							'SAMN02604324'
						]
					})

					expect(result.keywords).deep.equal([
						'chemoreceptor',
						'chemotaxis',
						'galactose binding protein',
						'membrane protein',
						'transducer',
						'trg gene'
					])

					expect(result.segment).deep.equal({
						number: 2,
						total: 4
					})
				})
			})
		})
	})
})
