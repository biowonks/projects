'use strict'

let Seq = require('./Seq')

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

	// ----------------------------------------------------
	// Private methods
	removeLeadingCaret_() {
		if (this.header_[0] === '>')
			this.header_ = this.header_.substr(1)
	}
}
