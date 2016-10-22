/* eslint-disable no-undefined, no-magic-numbers, no-unused-expressions */

'use strict'

// Vendor
const Promise = require('bluebird')

// Local
const genbankStream = require('./genbank-stream'),
	memoryStream = require('./memory-stream')

/**
 * Promisifies the stream parsing of GenBank input strings.
 *
 * @param {string} input string containing the example GenBank data to parse
 * @returns {Promise} future resolving with parsed results or rejecting with error
 */
function parse(input) {
	return new Promise((resolve, reject) => {
		let genbankReader = genbankStream(),
			inputReader = memoryStream(input),
			results = []

		inputReader
		.pipe(genbankReader)
		.on('error', reject)
		.on('data', (record) => {
			results.push(record)
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

describe('streams', function() {
	describe('genbank reader stream', function() {
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

		it('//[newline] returns single blank entry', function() {
			return parseSingle('//\n')
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

		it('ignores BASE COUNT keyword', function() {
			return parseSingle(closeInput('BASE COUNT  a 322'))
		})

		it('custom keywords', function() {
			return parseSingle(closeInput('DUMMY       value'))
		})

		it('emits error on keyword without necessary padding', function() {
			return parseThrowsError(closeInput('ORIGIN'))
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
						secondary: []
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

			it('emits error if spread across multiple lines', function() {
				return parseThrowsError(closeInput('SEGMENT     1 of 2\n' +
					'           2 of 2'))
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
			it('emits error if empty value', function() {
				return parseThrowsError(closeInput('SOURCE      '))
			})

			it('common name on single line', function() {
				return parseSingle(closeInput('SOURCE      Helicobacter pylori A45'))
				.then((result) => {
					expect(result.source).deep.equal({
						commonName: 'Helicobacter pylori A45',
						formalName: null,
						taxonomicRanks: null
					})
				})
			})

			it('common name on multiple lines', function() {
				return parseSingle(closeInput('SOURCE      Line 1\n' +
					'            Line 2'))
				.then((result) => {
					expect(result.source).deep.equal({
						commonName: 'Line 1 Line 2',
						formalName: null,
						taxonomicRanks: null
					})
				})
			})

			it('emits error on empty formal name', function() {
				let input = 'SOURCE      Helicobacter pylori A45\n' +
					'  ORGANISM  '
				return parseThrowsError(closeInput(input))
			})

			it('emits error if missing taxonomy', function() {
				let input = 'SOURCE      Helicobacter pylori A45\n' +
					'  ORGANISM  Helicobacter pylori A45'
				return parseThrowsError(closeInput(input))
			})

			it('emits error if formal name contains semicolon', function() {
				let input = 'SOURCE      Helicobacter pylori A45\n' +
					'  ORGANISM  Helicobacter pylori A45;'
				return parseThrowsError(closeInput(input))
			})

			it('multiple line formal line with taxonomy', function() {
				let input = 'SOURCE      Helicobacter pylori A45\n' +
					'  ORGANISM  Helicobacter pylori\n' +
					'            A45\n' +
					'            Bacteria; Proteobacteria; Epsilonproteobacteria; Campylobacterales;\n' +
					'            Helicobacteraceae; Helicobacter.'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.source).deep.equal({
						commonName: 'Helicobacter pylori A45',
						formalName: 'Helicobacter pylori A45',
						taxonomicRanks: [
							'Bacteria',
							'Proteobacteria',
							'Epsilonproteobacteria',
							'Campylobacterales',
							'Helicobacteraceae',
							'Helicobacter'
						]
					})
				})
			})

			it('single line for the taxonomy', function() {
				let input = 'SOURCE      halophilic archaeon DL31\n' +
					'  ORGANISM  halophilic archaeon DL31\n' +
					'            Archaea.'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.source).deep.equal({
						commonName: 'halophilic archaeon DL31',
						formalName: 'halophilic archaeon DL31',
						taxonomicRanks: [
							'Archaea'
						]
					})
				})
			})

			it('multiple SOURCE sections emits error', function() {
				let input = 'SOURCE      Helicobacter pylori A45\n' +
					'SOURCE      Helicobacter pylori A45'
				return parseThrowsError(closeInput(input))
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// REFERENCE
		describe('REFERENCE', function() {
			it('emits error if empty value', function() {
				return parseThrowsError(closeInput('REFERENCE   '))
			})

			it('emits error if does not begin with positive integer value', function() {
				return parseThrowsError(closeInput('REFERENCE   0'))
			})

			it('emits error if no separating space between reference number and notes', function() {
				return parseThrowsError(closeInput('REFERENCE   1(bases)'))
			})

			it('requires only positive reference number', function() {
				return parseSingle(closeInput('REFERENCE   1'))
				.then((result) => {
					expect(result.references).deep.equal([
						{
							number: 1,
							notes: null,
							authors: null,
							consortium: null,
							title: null,
							journal: null,
							pubmed: null,
							medline: null,
							remark: null
						}
					])
				})
			})

			it('number and notes', function() {
				return parseSingle(closeInput('REFERENCE   2  (bases 1 to 1634)'))
				.then((result) => {
					let ref = result.references[0]
					expect(ref.number).equal(2)
					expect(ref.notes).equal('(bases 1 to 1634)')
				})
			})

			it('notes may span multiple lines', function() {
				return parseSingle(closeInput('REFERENCE   2  (bases 1 to\n' +
					'            1634)'))
				.then((result) => {
					let ref = result.references[0]
					expect(ref.number).equal(2)
					expect(ref.notes).equal('(bases 1 to 1634)')
				})
			})

			let optionalsButNotEmpty = [
				{subKeyword: '  AUTHORS   ', resultField: 'authors'},
				{subKeyword: '  CONSRTM   ', resultField: 'consortium'},
				{subKeyword: '  TITLE     ', resultField: 'title'},
				{subKeyword: '  JOURNAL   ', resultField: 'journal'},
				{subKeyword: '  REMARK    ', resultField: 'remark'}
			]
			optionalsButNotEmpty.forEach((optionalButNotEmpty) => {
				let {subKeyword, resultField} = optionalButNotEmpty,
					friendlySubKeyword = subKeyword.trim()

				it(`emits error if empty value for ${friendlySubKeyword}`, function() {
					let input = 'REFERENCE   1\n' +
						`${subKeyword}`
					return parseThrowsError(closeInput(input))
				})

				it(`single line value for ${friendlySubKeyword}`, function() {
					let input = 'REFERENCE   1\n' +
						`${subKeyword}the first line`
					return parseSingle(closeInput(input))
					.then((result) => {
						let ref = result.references[0]
						expect(ref[resultField]).equal('the first line')
					})
				})

				it(`multiple line value for ${friendlySubKeyword}`, function() {
					let input = 'REFERENCE   1\n' +
						`${subKeyword}the first line\n` +
						'            and the second line'
					return parseSingle(closeInput(input))
					.then((result) => {
						let ref = result.references[0]
						expect(ref[resultField]).equal('the first line and the second line')
					})
				})
			})

			it('emits error if PUBMED exists without JOURNAL parent', function() {
				return parseThrowsError(closeInput('REFERENCE   1\n' +
					'   PUBMED   1234'))
			})

			// let numberSubKeywords = ['  MEDLINE   ', '   PUBMED   ']
			let numberSubKeywords = ['   PUBMED   ']
			numberSubKeywords.forEach((numberSubKeyword) => {
				let friendlySubKeyword = numberSubKeyword.trim(),
					resultField = friendlySubKeyword.toLowerCase()
				it(`emits error if ${friendlySubKeyword} value spans multiple lines`, function() {
					let input = 'REFERENCE   1\n' +
						'  JOURNAL   Genome Announc 3 (2) (2015)\n' +
						`${friendlySubKeyword}12345\n` +
						'            6789'
					return parseThrowsError(closeInput(input))
				})

				it(`emits error if empty value for ${friendlySubKeyword}`, function() {
					let input = 'REFERENCE   1\n' +
						'  JOURNAL   Genome Announc 3 (2) (2015)\n' +
						`${numberSubKeyword}`
					return parseThrowsError(closeInput(input))
				})

				it('emits error if contains more than a single positive integer', function() {
					let input = 'REFERENCE   1\n' +
						'  JOURNAL   Genome Announc 3 (2) (2015)\n' +
						`${numberSubKeyword}1 2`
					return parseThrowsError(closeInput(input))
				})

				it(`parses integer correctly for ${friendlySubKeyword}`, function() {
					let input = 'REFERENCE   1\n' +
						'  JOURNAL   Genome Announc 3 (2) (2015)\n' +
						`${numberSubKeyword}122`

					return parseSingle(closeInput(input))
					.then((result) => {
						let ref = result.references[0]
						expect(ref[resultField]).equal(122)
					})
				})
			})

			it('multiple references', function() {
				let input = 'REFERENCE   1\n' +
					'REFERENCE   2'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.references.length).equal(2)
					expect(result.references[0].number).equal(1)
					expect(result.references[1].number).equal(2)
				})
			})

			it('complete reference', function() {
				let input = 'REFERENCE   1  (bases 1 to 1634)\n' +
					'  AUTHORS   Kersulyte,D., Bertoli,M.T., Tamma,S., Keelan,M., Munday,R.,\n' +
					'            Geary,J., Veldhuyzen van Zanten,S., Goodman,K.J. and Berg,D.E.\n' +
					'  TITLE     Complete Genome Sequences of Two Helicobacter pylori Strains from a\n' +
					'            Canadian Arctic Aboriginal Community\n' +
					'  JOURNAL   Genome Announc 3 (2) (2015)\n' +
					'   PUBMED   25883278\n' +
					'  REMARK    Publication Status: Online-Only'
				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.references).deep.equal([
						{
							number: 1,
							notes: '(bases 1 to 1634)',
							authors: 'Kersulyte,D., Bertoli,M.T., Tamma,S., Keelan,M., Munday,R., ' +
								'Geary,J., Veldhuyzen van Zanten,S., Goodman,K.J. and Berg,D.E.',
							consortium: null,
							title: 'Complete Genome Sequences of Two Helicobacter pylori Strains from a ' +
								'Canadian Arctic Aboriginal Community',
							journal: 'Genome Announc 3 (2) (2015)',
							pubmed: 25883278,
							medline: null,
							remark: 'Publication Status: Online-Only'
						}
					])
				})
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// COMMENT
		describe('COMMENT', function() {
			it('emits error if empty value', function() {
				return parseThrowsError(closeInput('COMMENT     '))
			})

			it('multiline comment with blank lines', function() {
				let input = 'COMMENT     line 1\n' +
					'            \n' +
					'            line 2\n' +
					'            '

				return parseSingle(closeInput(input))
				.then((result) => {
					expect(result.comment).equal('line 1\n\nline 2')
				})
			})

			it('multiple COMMENT sections emits error', function() {
				let input = 'COMMENT     line 1\n' +
					'COMMENT     line 2'
				return parseThrowsError(closeInput(input))
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// CONTIG
		describe('CONTIG', function() {
			it('emits error if empty value', function() {
				return parseThrowsError(closeInput('CONTIG      '))
			})

			it('single line', function() {
				return parseSingle(closeInput('CONTIG      join(CP003478.1:1..1634)'))
				.then((result) => {
					expect(result.contig).equal('join(CP003478.1:1..1634)')
				})
			})

			it('multiple lines', function() {
				return parseSingle(closeInput('CONTIG      join(CP003478.1:1..1634\n' +
					'            )'))
				.then((result) => {
					expect(result.contig).equal('join(CP003478.1:1..1634)')
				})
			})

			it('multiple CONTIG sections emits error', function() {
				let input = 'CONTIG     line 1\n' +
					'CONTIG     line 2'
				return parseThrowsError(closeInput(input))
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// ORIGIN
		describe('ORIGIN', function() {
			it('does not emit error on empty value', function() {
				return parseSingle(closeInput('ORIGIN      '))
				.then((result) => {
					expect(result.origin).equal('')
				})
			})

			it('ignores text on same line as ORIGIN', function() {
				return parseSingle(closeInput('ORIGIN      abc\n' +
					'        1 g'))
				.then((result) => {
					expect(result.origin).equal('g')
				})
			})

			it('single character sequence', function() {
				return parseSingle(closeInput('ORIGIN      \n' +
					'        1 g'))
				.then((result) => {
					expect(result.origin).equal('g')
				})
			})

			it('multiline sequence', function() {
				return parseSingle(closeInput('ORIGIN      \n' +
					'        1 gcccttagat aagcttacta gaaagcttgt aagaattagc agacaactga gtaaaaaaat\n' +
					'       61 ccacccaaaa accaaagggg ataaaaccaa gaaatctaat aattacttaa agcattctaa'))
				.then((result) => {
					expect(result.origin).equal('gcccttagataagcttactagaaagcttgtaagaattagcagacaactgagtaaaaaaatccacccaaaaaccaaaggggataaaaccaagaaatctaataattacttaaagcattctaa')
				})
			})

			it('multiple ORIGIN sections emits error', function() {
				let input = 'ORIGIN      \n' +
					'ORIGIN      \n'
				return parseThrowsError(closeInput(input))
			})
		})

		// ------------------------------------------------
		// ------------------------------------------------
		// Feature table
		describe('FEATURES', function() {
			function featureWrapper(value) {
				return closeInput('FEATURES    \n' + value)
			}

			function parseAndExpect(input, expected) {
				return parseSingle(input)
				.then((result) => {
					expect(result.features).deep.equal(expected)
				})
			}

			it('no features returns empty array', function() {
				return parseSingle(closeInput('FEATURES    '))
				.then((result) => {
					expect(result.features).deep.equal([])
				})
			})

			it('multiple FEATURES sections emits error', function() {
				let input = 'FEATURES    \n' +
					'FEATURES    '
				return parseThrowsError(closeInput(input))
			})

			it('emits error if continuation line without associated feature key', function() {
				let input = 'FEATURES    \n' +
					'                     /pseudo'
				return parseThrowsError(closeInput(input))
			})

			it('emits error if qualifier name is "key"', function() {
				let input = 'FEATURES    \n' +
					'     source          1..204\n' +
					'                     /key'
				return parseThrowsError(closeInput(input))
			})

			it('emits error if qualifier name is "key"', function() {
				let input = 'FEATURES    \n' +
					'     source          1..204\n' +
					'                     /location'
				return parseThrowsError(closeInput(input))
			})

			it('solely location', function() {
				let input = featureWrapper('     source          1..204')
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204'
					}
				])
			})

			it('location may span multiple lines', function() {
				let input = featureWrapper(
					'     source          1..\n' +
					'                     204\n' +
					'                     /pseudo'
				)
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204',
						pseudo: true
					}
				])
			})

			it('valueless qualifier', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /pseudo'
				)
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204',
						pseudo: true
					}
				])
			})

			it('empty free-form text is preserved as empty string', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /name=""'
				)
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204',
						name: ['']
					}
				])
			})

			it('throws error if even number of double quotes at beginning', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /name=""here is a quote"'
				)
				return parseThrowsError(input)
			})

			it('throws error if even number of double quotes at end', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /name="here is a quote""'
				)
				return parseThrowsError(input)
			})


			it('free-form double quotes at end are converted to single quotes', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /name="here is a ""quote"""'
				)
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204',
						name: ['here is a "quote"']
					}
				])
			})

			it('free-form double quotes at beginning are converted to single quotes', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /name="""here"" is a quote"'
				)
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204',
						name: ['"here" is a quote']
					}
				])
			})

			it('free-form double quotes in middle are converted to single quotes', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /name="here ""is"" a quote"'
				)
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204',
						name: ['here "is" a quote']
					}
				])
			})

			it('double quotes at end of line followed by a continuation line', function() {
				let input = featureWrapper(
					'     source          1..204\n' +
					'                     /name="here is a ""quote""\n' +
					'                     that continues here."'
				)
				return parseAndExpect(input, [
					{
						key: 'source',
						location: '1..204',
						name: ['here is a "quote" that continues here.']
					}
				])
			})

			it('literally parses controlled vocabularly without quotes', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /direction=leFt'
				)
				return parseAndExpect(input, [
					{
						key: 'gene',
						location: '1..204',
						direction: ['leFt']
					}
				])
			})

			it('values are trimmed', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /direction= leFt '
				)
				return parseAndExpect(input, [
					{
						key: 'gene',
						location: '1..204',
						direction: ['leFt']
					}
				])
			})

			it('values inside free form quotes are not trimmed', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /description= " transmutase "'
				)
				return parseAndExpect(input, [
					{
						key: 'gene',
						location: '1..204',
						description: [' transmutase ']
					}
				])
			})

			it('leading and/or trailing space on continuation lines is trimmed', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /description="first line\n' +
					'                      second line\n' +
					'                     third line \n' +
					'                      fourth line \n' +
					'                     fifth."'
				)
				return parseAndExpect(input, [
					{
						key: 'gene',
						location: '1..204',
						description: ['first line second line third line fourth line fifth.']
					}
				])
			})

			it('empty continuation line throws error', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /description="first line\n' +
					'                     '
				)
				return parseThrowsError(input)
			})

			it('continuation line with merely whitespace throws error', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /description="first line\n' +
					'                          \n' +
					'                     more stuff"'
				)
				return parseThrowsError(input)
			})


			let numbers = [0, 1, 2., 2.3, 0., 0.59]
			numbers.forEach((number) => {
				it(`numeric value ${number} is interpreted as number`, function() {
					let input = featureWrapper(
						'     gene            1..204\n' +
						'                     /saturation=' + number
					)
					return parseAndExpect(input, [
						{
							key: 'gene',
							location: '1..204',
							saturation: [number]
						}
					])
				})
			})

			it('multiple features', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /description="transmutase"\n' +
					'                     /citation=[2]\n' +
					'                     /saturation=5'
				)
				return parseAndExpect(input, [
					{
						key: 'gene',
						location: '1..204',
						description: ['transmutase'],
						citation: ['[2]'],
						saturation: [5]
					}
				])
			})

			it('qualifier with multiple values', function() {
				let input = featureWrapper(
					'     gene            1..204\n' +
					'                     /saturation=5\n' +
					'                     /saturation=6'
				)
				return parseAndExpect(input, [
					{
						key: 'gene',
						location: '1..204',
						saturation: [5, 6]
					}
				])
			})

			it('translated sequences do not have whitespace', function() {
				let input = featureWrapper(
					'     CDS             1..204\n' +
					'                     /translation="MQFQKALFPLPLLFLSYCIAEENGAYASVGFEYSISHAVEHNNP\n' +
					'                     FLNQERIQIISNAQNKIYKLNQVKNEITNMPNTFAYINNALKNNSKLTPTEMQAEQYY\n' +
					'                     LQSTF"\n' +
					'                     /inference="EXISTENCE: similar to AA\n' +
					'                     sequence:RefSeq:WP_001169510.1"'
				)
				return parseAndExpect(input, [
					{
						key: 'CDS',
						location: '1..204',
						translation: [
							'MQFQKALFPLPLLFLSYCIAEENGAYASVGFEYSISHAVEHNNP' +
							'FLNQERIQIISNAQNKIYKLNQVKNEITNMPNTFAYINNALKNNSKLTPTEMQAEQYY' +
							'LQSTF'
						],
						inference: [
							'EXISTENCE: similar to AA sequence:RefSeq:WP_001169510.1'
						]
					}
				])
			})
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
					'SEGMENT     2 of 4\n' +
					'SOURCE      Helicobacter pylori A45\n' +
					'  ORGANISM  Helicobacter pylori A45\n' +
					'            Bacteria; Proteobacteria; Epsilonproteobacteria; Campylobacterales;\n' +
					'            Helicobacteraceae; Helicobacter.\n' +
					'REFERENCE   1  (bases 1 to 1634)\n' +
					'  AUTHORS   Kersulyte,D., Bertoli,M.T., Tamma,S., Keelan,M., Munday,R.,\n' +
					'            Geary,J., Veldhuyzen van Zanten,S., Goodman,K.J. and Berg,D.E.\n' +
					'  TITLE     Complete Genome Sequences of Two Helicobacter pylori Strains from a\n' +
					'            Canadian Arctic Aboriginal Community\n' +
					'  JOURNAL   Genome Announc 3 (2) (2015)\n' +
					'   PUBMED   25883278\n' +
					'  REMARK    Publication Status: Online-Only\n' +
					'COMMENT     REFSEQ INFORMATION: The reference sequence was derived from\n' +
					'            CP003478.\n' +
					'FEATURES             Location/Qualifiers\n' +
					'     source          1..1494183\n' +
					'                     /organism="Helicobacter pylori Aklavik86"\n' +
					'                     /mol_type="genomic DNA"\n' +
					'                     /strain="Aklavik86"\n' +
					'                     /host="Homo sapiens"\n' +
					'                     /db_xref="taxon:1055532"\n' +
					'                     /country="Canada: Aklavik village, Northwest Territories"\n' +
					'     gene            complement(11..427)\n' +
					'                     /locus_tag="HPAKL86_RS00005"\n' +
					'                     /old_locus_tag="HPAKL86_00005"\n' +
					'     CDS             complement(11..427)\n' +
					'                     /locus_tag="HPAKL86_RS00005"\n' +
					'                     /old_locus_tag="HPAKL86_00005"\n' +
					'                     /inference="EXISTENCE: similar to AA\n' +
					'                     sequence:RefSeq:WP_015086508.1"\n' +
					'                     /note="Derived by automated computational analysis using\n' +
					'                     gene prediction method: Protein Homology."\n' +
					'                     /codon_start=1\n' +
					'                     /transl_table=11\n' +
					'                     /product="transcription antitermination protein NusB"\n' +
					'                     /protein_id="WP_015086508.1"\n' +
					'                     /db_xref="GI:504899406"\n' +
					'                     /translation="MATRTQARGAVVELLYAFESGNEEIKKIASSMLEEKKIKNNQLA\n' +
					'                     FALSLFNGVLEKINEIDALIEPHLKDWDFKRLGSMEKAILRLGAYEIGFTPTQNPIII\n' +
					'                     NECIELGKLYAEPNTPKFLNAILDSLSKKLAQKSLN"\n' +
					'CONTIG      join(CP003478.1:1..1634)\n' +
					'ORIGIN      \n' +
					'        1 gcccttagat aagcttacta gaaagcttgt aagaattagc agacaactga gtaaaaaaat\n' +
					'       61 ccacccaaaa accaaagggg ataaaaccaa gaaatctaat aattacttaa agcattctaa\n' +
					'      121 aaagcttacc cacttgcatg aaaaaatcgc taacatcaga cttgattttt tacacaagct\n' +
					'      181 cacaagctct cttataagac actc'
				))
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
						secondary: []
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

					expect(result.source).deep.equal({
						commonName: 'Helicobacter pylori A45',
						formalName: 'Helicobacter pylori A45',
						taxonomicRanks: [
							'Bacteria',
							'Proteobacteria',
							'Epsilonproteobacteria',
							'Campylobacterales',
							'Helicobacteraceae',
							'Helicobacter'
						]
					})

					expect(result.references).deep.equal([
						{
							number: 1,
							notes: '(bases 1 to 1634)',
							authors: 'Kersulyte,D., Bertoli,M.T., Tamma,S., Keelan,M., Munday,R., ' +
								'Geary,J., Veldhuyzen van Zanten,S., Goodman,K.J. and Berg,D.E.',
							consortium: null,
							title: 'Complete Genome Sequences of Two Helicobacter pylori Strains from a ' +
								'Canadian Arctic Aboriginal Community',
							journal: 'Genome Announc 3 (2) (2015)',
							pubmed: 25883278,
							medline: null,
							remark: 'Publication Status: Online-Only'
						}
					])

					expect(result.comment).equal('REFSEQ INFORMATION: The reference sequence was derived from\nCP003478.')

					expect(result.features).deep.equal([
						{
							key: 'source',
							location: '1..1494183',
							organism: ['Helicobacter pylori Aklavik86'],
							mol_type: ['genomic DNA'],
							strain: ['Aklavik86'],
							host: ['Homo sapiens'],
							db_xref: ['taxon:1055532'],
							country: ['Canada: Aklavik village, Northwest Territories']
						},
						{
							key: 'gene',
							location: 'complement(11..427)',
							locus_tag: ['HPAKL86_RS00005'],
							old_locus_tag: ['HPAKL86_00005']
						},
						{
							key: 'CDS',
							location: 'complement(11..427)',
							locus_tag: ['HPAKL86_RS00005'],
							old_locus_tag: ['HPAKL86_00005'],
							inference: ['EXISTENCE: similar to AA sequence:RefSeq:WP_015086508.1'],
							note: ['Derived by automated computational analysis using gene prediction method: Protein Homology.'],
							codon_start: [1],
							transl_table: [11],
							product: ['transcription antitermination protein NusB'],
							protein_id: ['WP_015086508.1'],
							db_xref: ['GI:504899406'],
							translation: ['MATRTQARGAVVELLYAFESGNEEIKKIASSMLEEKKIKNNQLAFALSLFNGVLEKINEIDALIEPHLKDWDFKRLGSMEKAILRLGAYEIGFTPTQNPIIINECIELGKLYAEPNTPKFLNAILDSLSKKLAQKSLN']
						}
					])

					expect(result.contig).equal('join(CP003478.1:1..1634)')

					expect(result.origin).equal(
						'gcccttagataagcttactagaaagcttgtaagaattagcagacaactgagtaaaaaaat' +
						'ccacccaaaaaccaaaggggataaaaccaagaaatctaataattacttaaagcattctaa' +
						'aaagcttacccacttgcatgaaaaaatcgctaacatcagacttgattttttacacaagct' +
						'cacaagctctcttataagacactc'
					)
				})
			})

			it('multiple non-empty records', function() {
				return parse('LOCUS       NC_019565               1634 bp    DNA     circular CON 30-JUL-2015\n' +
				'//\n' +
				'LOCUS       NC_019565               1634 bp    DNA     circular CON 30-JUL-2015\n' +
				'//\n')
				.then((results) => {
					let expectedLocus = {
						name: 'NC_019565',
						bp: 1634,
						moleculeType: 'DNA',
						topology: 'circular',
						divisionCode: 'CON',
						date: '30-JUL-2015'
					}

					expect(results.length).equal(2)
					expect(results[0].locus).deep.equal(expectedLocus)
					expect(results[1].locus).deep.equal(expectedLocus)
				})
			})
		})
	})
})
