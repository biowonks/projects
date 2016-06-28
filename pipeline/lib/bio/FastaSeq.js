'use strict'

// Local
const Seq = require('./Seq')

module.exports =
class FastaSeq extends Seq {
	constructor(optHeader = '', optSequence) {
		super(optSequence)

		this.header_ = optHeader
		this.removeLeadingCaret_()
		this.header_ = this.header_.trim()
	}

	header() {
		return this.header_
	}

	/**
	 * @param {String} newHeader
	 */
	setHeader(newHeader) {
		this.header_ = newHeader
	}

	/**
	 * Convert this instance back into a FASTA formatted string. For example,
	 *
	 * >chea
	 * HDSDKJTASDF <-- newline here as well
	 *
	 * @param {Number?} optCharsPerLine an optional number of lines to split the sequence into;
	 *   defaults to Seq.kDefaultCharsPerLine
	 * @returns {String} FASTA string
	 */
	toString(optCharsPerLine) {
		let fastaSequence = this.fastaSequence(optCharsPerLine)
		return `>${this.header_}\n${fastaSequence}`
	}

	// ----------------------------------------------------
	// Private methods
	removeLeadingCaret_() {
		if (this.header_[0] === '>')
			this.header_ = this.header_.substr(1)
	}
}
