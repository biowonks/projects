'use strict'

// Local
let LineStream = require('./LineStream')

// Constants
const kNumLocusFields = 8

/**
 * This stream parses one or more input GenBank records and emits a corresponding POD encapsulating
 * this information.
 *
 * Only performs limited validation. For example, this script checks for 7 whitespace separated
 * values following the LOCUS keyword; however, the actual values themselves are not inspected.
 * Thus, most validation is delegated to other classes. No checks are done to ensure that all
 * data is present. GenbankReaderStream happily emits sparsely populated PODs with what information
 * is able to be extracted.
 *
 * For example:
 *
 * '//' --> empty POD ({locus: null, ...})
 *
 * `LOCUS ...
 * //` --> will only have the locus line values.
 */
module.exports =
class GenbankReaderStream extends LineStream {
	constructor() {
		super()
		this.entry_ = null
		this.inEntry_ = false

		// this.buffer_ = ''
		// this.currentKeyword_ = null
		// this.inKeyword_ = false
	}

	// ----------------------------------------------------
	// Overrided methods
	_transform(line, encoding, done) {
		try {
			if (!this.entry_)
				this.entry_ = this.blankEntry_()

			if (/^LOCUS /.test(line)) {
				this.entry_.locus = this.parseLocus_(line)
			}
			else if (/^\/\//.test(line)) {
				this.push(this.entry_)
				this.entry_ = null
			}

			done()
		}
		catch (error) {
			done(error)
		}

		// let isKeywordContinuation = /^ {10}/.test(line)
		// if (isKeywordContinuation) {
		// 	this.buffer_ += line
		// 	done()
		// 	return
		// }
		// else if (this.buffer_) {
		// }
		// if (/^DEFINITION /.test(line)) {
		// 	this.buffer_ = line
		// 	this.inKeyword_ = true
		// }
		// else if ()
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
			locus: null
		}
	}

	/**
	 * The LOCUS line is structured with values in specific position ranges; however, it is recommended
	 * to use a token based approach for parsing and not rely on actual positions in case this changes
	 * in the future.
	 *
	 * Note that this does not support really old GenBank formats (e.g. those predating 2000).
	 *
	 * @param {string} line contains the expected locus fields
	 * @returns {object} parsed locus values
	 */
	parseLocus_(line) {
		let parts = line.split(/\s+/),
			hasRightNumFields = parts.length === kNumLocusFields
		if (!hasRightNumFields)
			throw new Error(`LOCUS line does not have ${kNumLocusFields} fields: ${line}`)

		/* eslint-disable no-magic-numbers */
		return {
			name: parts[1],
			bp: Number(parts[2]),
			// (ss-|ds-|ms-)(NA|DNA|RNA|tRNA|rRNA|mRNA|uRNA)
			// ss- = single stranded
			// ds- = double stranded
			// ms- = mixed stranded
			// uRNA = small nuclear RNA
			moleculeType: parts[4],
			topology: parts[5],
			divisionCode: parts[6],
			date: parts[7]
		}
		/* eslint-enable no-magic-numbers */
	}
}
