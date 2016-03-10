'use strict'

// Core node libraries
let assert = require('assert'),
	StringDecoder = require('string_decoder').StringDecoder,
	Transform = require('stream').Transform;

// Local includes
let FastaSeq = require('../bio/FastaSeq')

// Constants
let kRecordSeparator = '\n>'

module.exports =
class FastaReaderStream extends Transform {
	constructor(optSkipEmptySequence) {
		super({objectMode: true})

		this.skipEmptySequence_ = !!optSkipEmptySequence
		this.buffer_ = ''
		this.decoder_ = new StringDecoder('utf8')
	}

	// ----------------------------------------------------
	// Private methods
	_flush(done) {
		// Allow empty files
		if (!this.buffer_.length)
			return done()

		if (this.buffer_[0] !== '>')
			this.throwMissingCaret_()

		let header = '',
			sequence = '',
			headerTo = this.buffer_.indexOf('\n')
		if (headerTo !== -1) {  // A newline (and consequently header text is present) was found within the buffer
			header = this.buffer_.substr(1, headerTo - 1)
			if (headerTo !== this.buffer_.length - 1)
				sequence = this.buffer_.substr(headerTo + 1)
		}
		else if (this.buffer_.length > 1) {
			// There is no newline in the buffer. Thus, this record consists solely of a header
			header = this.buffer_
		}

		this.processSequence_(header, sequence)
		this.buffer_ = ''

		done()
	}

	_transform(chunk, encoding, done) {
		this.buffer_ += this.decoder_.write(chunk)

		let lastPos = 0,
			pos = this.buffer_.indexOf(kRecordSeparator, lastPos)
		while (pos >= 0) {
			if (this.buffer_[lastPos] !== '>')
				this.throwMissingCaret_()

			let header = '',
				headerTo = this.buffer_.indexOf('\n', lastPos)
			if (headerTo >= 0)
				header = this.buffer_.substr(lastPos + 1, headerTo - lastPos - 1)

			let sequence = ''
			if (pos !== headerTo)
				sequence = this.buffer_.substr(headerTo + 1, pos - headerTo - 1)

			this.processSequence_(header, sequence)

			lastPos = pos + 1

			pos = this.buffer_.indexOf(kRecordSeparator, lastPos)
		}

		if (lastPos)
			this.buffer_ = this.buffer_.substr(lastPos)

		done()
	}

	processSequence_(header, sequence) {
		assert(/\S/.test(header), 'fasta header must not be empty')

		let fastaSeq = new FastaSeq(header, sequence)
		if (fastaSeq.length())
			return this.push(fastaSeq)

		if (!this.skipEmptySequence_)
			throw new Error('fasta sequence is unexpectedly empty (' + header + ')')
	}

	throwMissingCaret_() {
		throw new Error('first character must be the > symbol')
	}
}
