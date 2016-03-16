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

	toString(optCharsPerLine) {
		
		if (!optCharsPerLine){
			optCharsPerLine = 0
		}
		else{
			assert(typeof(optCharsPerLine) == 'number', 'optCharsPerLine must be a number')
			optCharsPerLine = Math.max(parseInt(optCharsPerLine),0)
		}

		let string = '>' + this.header() + '\n',
			sequenceLength = this.length(),
			lineNum = this.length()/optCharsPerLine

		if (lineNum%1) lineNum = parseInt(lineNum) + 1

		if (optCharsPerLine > 0){
			for (let i = 0; i < lineNum; i++){
				if(i) string += "\n"
				string += this.subseq(i*optCharsPerLine + 1, Math.min(sequenceLength,(i+1)*optCharsPerLine)).sequence()
			}
		}
		else{
			string += this.sequence()
		}

		return string
	}
	
	// ----------------------------------------------------
	// Private methods
	removeLeadingCaret_() {
		if (this.header_[0] === '>')
			this.header_ = this.header_.substr(1)
	}	
}
