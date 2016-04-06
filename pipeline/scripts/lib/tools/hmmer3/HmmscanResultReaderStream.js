'use strict'

// Core node libraries
let Transform = require('stream').Transform,
	StringDecoder = require('string_decoder').StringDecoder,
	assert = require('assert')

// Local includes
let HmmscanResult = require('./HmmscanResult')

// Constants
let kRecordSeparator = '\n\/\/\n'

/**
 * HmmscanResultReaderStream parses raw HmmScan data and streams out objects
 * containing these results.
 */
module.exports =
class HmmscanResultReaderStream extends Transform {
	constructor() {
		super({objectMode: true})

		this.buffer_ = ''
		this.decoder_ = new StringDecoder('utf8')
	}

	_transform(chunk, encoding, done) {
		this.buffer_ += this.decoder_.write(chunk)

		let recordTo = this.buffer_.indexOf(kRecordSeparator)

		while (recordTo != -1) {
			let record = this.buffer_.substr(0, recordTo)

			this.parseHmmscanResult_(record)
			this.buffer_ = this.buffer_.substr(recordTo + kRecordSeparator.length, this.buffer_.length)
			recordTo = this.buffer_.indexOf(kRecordSeparator)
		}
		done()
	}

	_flush(done) {
		// TODO: Process any remaining buffer data (see FastaReaderStream for an example)if (!this.buffer_.length)

		if (!this.buffer_.length)
			return done()
		else if(this.buffer_.substr(0,4) == '[ok]')
			return done()

		let record = '',
			recordTo = this.buffer_.indexOf(kRecordSeparator)
		
		if (recordTo !== -1)
			record = this.buffer_.substr(0, recordTo)
			this.parseHmmscanResult_(record)
		
		this.buffer_ = ''
		done()
	}

	parseHmmscanResult_(record) {
		assert(/\S/.test(record), 'record must not be empty')

		let hmmscanResult = new HmmscanResult(record)
		return this.push(hmmscanResult)
	}
}
