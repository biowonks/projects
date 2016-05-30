'use strict'

// Core includes
let stream = require('stream')

/**
 * Nothing is streamed if the string is undefined, null, or empty.
 */
module.exports =
class StringStream extends stream.Readable {
	constructor(string, options) {
		super(options)
		this.string_ = string
		this.length_ = string ? string.length : 0
		this.offset_ = 0
	}

	_read(size) {
		// Case 1: falsy string
		if (!this.string_) {
			this.push(null)
			return
		}

		// Case 2: requesting fewer bytes than the string contains
		if (size < this.length_) {
			let substring = this.string_.substr(this.offset_, size)
			this.offset_ += size
			this.push(substring)
			if (this.offset_ >= this.length_)
				this.push(null)
		}
		// Case 3: requesting entire string
		else {
			this.push(this.string_)
			this.push(null)
		}
	}
}
