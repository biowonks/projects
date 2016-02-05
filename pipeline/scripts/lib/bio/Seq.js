'use strict'

// Core node libraries
let crypto = require('crypto')

module.exports =
class Seq {
	constructor(optSequence) {
		this.sequence_ = optSequence || ''
		this.clean_()
	}

	invalidSymbol() {
		return '@'
	}

	isEmpty() {
		return this.length() === 0
	}

	isValid() {
		return this.sequence_.indexOf('@') === -1
	}

	length() {
		return this.sequence_.length
	}

	sequence() {
		return this.sequence_
	}

	seqId() {
		let md5base64 = crypto.createHash('md5').update(this.sequence_).digest('base64')
		return md5base64.replace(/=+/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
	}

	// ----------------------------------------------------
	// Private methods
	clean_() {
		this.sequence_ = this.sequence_
			.replace(/\s+/g, '')
			.replace(/\W|\d|_/g, '@')
			.toUpperCase()
	}
}
