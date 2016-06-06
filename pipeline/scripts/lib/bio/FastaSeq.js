'use strict'

let Seq = require('./Seq'),
	assert = require('assert')

module.exports =
class FastaSeq extends Seq {
	constructor(optHeader, optSequence) {
		super(optSequence)

		this.header_ = optHeader ? optHeader : ''
		this.removeLeadingCaret_()
		this.header_ = this.header_.trim()
	}

	header() {
		return this.header_
	}

	/**
	 * Convert this instance back into a FASTA formatted string. For example,
	 *
	 * >chea
	 * HDSDKJTASDF <-- newline here as well
	 *
	 * @param {number?} optCharsPerLine an optional number of lines to split
	 *    the sequence into; defaults to 0 which implies outputting the entire
	 *    sequence on a single line
	 * @returns {string} FASTA string
	 */
	toString(optCharsPerLine) {
		let charsPerLine = !optCharsPerLine ? 0 : Math.max(parseInt(optCharsPerLine), 0)
		assert(typeof charsPerLine === 'number', 'optCharsPerLine must be a number')
		let splicedString = this.spliceNewlines_(charsPerLine)
		return `>${this.header_}\n${splicedString}`
	}

	// ----------------------------------------------------
	// Private methods
	removeLeadingCaret_() {
		if (this.header_[0] === '>')
			this.header_ = this.header_.substr(1)
	}

	/**
	 * @param {number} charsPerLine number of sequence characters per line
	 * @returns {string} FASTA sequence portion
	 */
	spliceNewlines_(charsPerLine) {
		assert(charsPerLine >= 0, 'charsPerLine must be 0 or a positive integer')
		let fullSequence = this.sequence()
		if (!charsPerLine)
			return `${fullSequence}\n`

		let result = ''
		for (let i = 0, z = fullSequence.length; i < z; i += charsPerLine)
			result += `${fullSequence.substr(i, charsPerLine)}\n`

		return result
	}
}
