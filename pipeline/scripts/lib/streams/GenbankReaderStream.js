'use strict'

// Core
let assert = require('assert')

// Local
let LineStream = require('./LineStream')

// Constants
const kKeywordInformationOffset = 12,
	kNumLocusFields = 7,
	kRootKeywordMap = {
		LOCUS: 'locus',
		DEFINITION: 'definition',
		ACCESSION: 'accession',
		VERSION: 'version',
		DBLINK: 'dbLink',
		KEYWORDS: 'keywords',
		SEGMENT: 'segment',
		SOURCE: 'source',
		REFERENCE: 'references',
		COMMENT: 'comment',
		FEATURES: 'features',
		CONTIG: 'contig',
		ORIGIN: 'origin'
	},
	kSingleValueRootKeywords = new Set([
		'LOCUS',
		'DEFINITION',
		'ACCESSION',
		'VERSION',
		'DBLINK',
		'KEYWORDS',
		'SEGMENT',
		'SOURCE',
		'COMMENT',
		'CONTIG',
		'ORIGIN'
	])
	// kDivisionCodes = new Set([
	// 	'PRI', // primate
	// 	'ROD', // rodent
	// 	'MAM', // other mammalian
	// 	'VRT', // other vertebrate
	// 	'INV', // invertebrate
	// 	'PLN', // plant, fungal, and algal
	// 	'BCT', // bacterial
	// 	'VRL', // viral
	// 	'PHG', // bacteriophage
	// 	'SYN', // synthetic
	// 	'UNA', // unannotated
	// 	'EST', // expressed sequence tags
	// 	'PAT', // patent
	// 	'STS', // sequence tagged sites
	// 	'GSS', // genome survey sequences
	// 	'HTG', // high throughput genomic
	// 	'HTC', // high throughput cDNA
	// 	'ENV', // environental sampling
	// 	'CON', // constructed
	// 	'TSA'  // transcriptome shotgun assembly sequences
	// ])

/**
 * Parses one or more input GenBank records and emits a corresponding POD encapsulatingthis
 * information.
 *
 * Only performs limited validation. For example, this script checks for 7 whitespace separated
 * values following the LOCUS keyword; however, the actual values themselves are not inspected.
 * Thus, most validation is delegated to other classes. No checks are done to ensure that all
 * data is present. GenbankReaderStream happily emits sparsely populated PODs with what information
 * is able to be extracted. If a keyword that should only appear once is found twice an error is
 * thrown.
 *
 * For example:
 *
 * '//' --> empty POD ({locus: null, ...})
 *
 * `LOCUS ...
 * //` --> will only have the locus line values.
 *
 * For the GenBank record specification, please see Section 3.4.2 Entry Organization of
 * ftp://ftp.ncbi.nih.gov/genbank/gbrel.txt
 *
 * Feature table specification: http://www.insdc.org/files/feature_table.html
 *
 * Notes:
 * - Old GenBank formats (e.g. those predating 2004) are not supported
 */
module.exports =
class GenbankReaderStream extends LineStream {
	constructor() {
		super({keepEmptyLines: true})
		//     ^^^^^^^^^^^^^^ For cases such as the COMMENT keyword
		this.entry_ = null

		this.keywordStack_ = []
		// this.currentKeyword_ = null
		this.currentLines_ = null
	}

	// ----------------------------------------------------
	// Overrided methods
	_transform(line, encoding, done) {
		try {
			// --------------------------------------------
			if (!this.entry_)
				this.entry_ = this.blankEntry_()

			// --------------------------------------------
			if (this.isKeywordContinuationLine_(line)) {
				if (!this.keywordStack_.length)
					throw new Error('Keyword continuation line found without associated keyword')

				this.currentLines_.push(this.extractKeywordInfo_(line))
				done()
				return
			}

			// --------------------------------------------
			let keyword = this.keywordFromLine_(line)
			if (keyword) {
				this.handleKeywordLine_(keyword, this.extractKeywordInfo_(line))
				done()
				return
			}

			// --------------------------------------------
			let isTerminator = line[0] === '/' && line[1] === '/'
			if (isTerminator) {
				this.handlePreviousKeyword_()
				this.push(this.entry_)
				this.entry_ = null
				done()
				return
			}

			throw new Error(`Internal error; unhandled line: ${line}`)
		}
		catch (error) {
			done(error)
		}
	}

	_flush(done) {
		if (this.entry_)
			done(new Error('Last record missing record terminator: //'))
		else
			done()
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * @returns {object} blank result initialized with null values
	 */
	blankEntry_() {
		return {
			locus: null,
			definition: null
		}
	}

	extractKeywordInfo_(line) {
		return line.substr(kKeywordInformationOffset).trim()
	}

	handleKeywordLine_(keyword, keywordInfo) {
		let isRootKeyword = keyword[0] !== ' '
		if (isRootKeyword) {
			let invalidRootKeyword = !(keyword in kRootKeywordMap)
			if (invalidRootKeyword)
				throw new Error(`Invalid root keyword: ${keyword}`)

			this.handlePreviousKeyword_()

			let isDuplicateRootKeyword = kSingleValueRootKeywords.has(keyword) &&
				!!this.entry_[kRootKeywordMap[keyword]]
			if (isDuplicateRootKeyword)
				throw new Error(`Record contains multiple ${keyword} lines`)
		}

		switch (keyword) {
			case 'LOCUS':
				this.entry_.locus = this.parseLocus_(keywordInfo)
				break

			case 'DEFINITION':
				this.keywordStack_.push('DEFINITION')
				this.currentLines_ = [keywordInfo]
				break
		}
	}

	handlePreviousKeyword_() {
		if (!this.keywordStack_.length)
			return

		switch (this.keywordStack_[0]) {
			case 'DEFINITION':
				this.entry_.definition = this.parseDefinition_(this.currentLines_)
				break

			default:
				assert(false, 'Unexpected root keyword missing from kRootKeywordMap')
		}

		this.keywordStack_.length = 0
	}

	isKeywordContinuationLine_(line) {
		return /^ {10}/.test(line)
	}

	/**
	 * Based on the specification, looks for the following cases:
	 * 1) Keyword beginning at the first column up to a maximum of 10 characters
	 * 2) Subkeyword beginning in column 3 and up to 8 characters long
	 * 3) Subkeyword beginning in column 4 and up to 7 characters long
	 *
	 * @param {string} line the input line to inspect
	 * @returns {string} any matching keyword or subkeyword (with prefixed spacing); null otherwise
	 */
	keywordFromLine_(line) {
		let matches = /^([A-Z]{1,10}| {2}[A-Z]{1,8}| {3}[A-Z]{1,7}) {2}/.exec(line)
		return matches ? matches[1] : null
	}

	lastKeyword_() {
		return this.keywordStack_[this.keywordStack_.length - 1]
	}

	/**
	 * The LOCUS line is structured with values in specific position ranges; however, it is recommended
	 * to use a token based approach for parsing and not rely on actual positions in case this changes
	 * in the future.
	 *
	 * @param {string} keywordInfo contains the expected locus fields without 'LOCUS'
	 * @returns {object} parsed locus values
	 */
	parseLocus_(keywordInfo) {
		let parts = keywordInfo.split(/\s+/),
			hasRightNumFields = parts.length === kNumLocusFields
		if (!hasRightNumFields)
			throw new Error(`LOCUS line does not have ${kNumLocusFields} fields: ${keywordInfo}`)

		/* eslint-disable no-magic-numbers */
		return {
			name: parts[0],
			bp: Number(parts[1]),
			// (ss-|ds-|ms-)(NA|DNA|RNA|tRNA|rRNA|mRNA|uRNA)
			// ss- = single stranded
			// ds- = double stranded
			// ms- = mixed stranded
			// uRNA = small nuclear RNA
			moleculeType: parts[3],
			topology: parts[4],
			divisionCode: parts[5],
			date: parts[6]
		}
		/* eslint-enable no-magic-numbers */
	}

	parseDefinition_(lines) {
		let definition = lines.join(' ')
		if (!definition)
			throw new Error('DEFINITION value is required')

		if (definition[definition.length - 1] !== '.')
			throw new Error('DEFINITION must end with a period')

		return definition
	}
}
