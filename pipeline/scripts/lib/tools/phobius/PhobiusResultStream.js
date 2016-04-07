'use strict'

// Core node libraries
let assert = require('assert'),
	StringDecoder = require('string_decoder').StringDecoder,
	Transform = require('stream').Transform;


// Constants
let kRecordSeparator = '\n'


module.exports =
class PhobiusReadStream extends Transform {
	constructor() {
		super({objectMode: true})

		this.buffer_ = ''
		this.decoder_ = new StringDecoder('utf8')
	}

	// ----------------------------------------------------
	// Private methods
	_flush(done) {
		// Allow empty lines 
		if (!this.buffer_.length)
			return done()

		let line = '',
			lineTo = this.buffer_.indexOf('\n')

		if (lineTo !== -1) { 
			line = this.buffer_.substr(1, lineTo - 1)
		}

		this.processLine_(line)
		this.buffer_ = ''

		done()
	}

	_transform(chunk, encoding, done) {
		this.buffer_ += this.decoder_.write(chunk)

		let lastPos = 0,
			lineTo = this.buffer_.indexOf(kRecordSeparator, lastPos)
		while (lineTo >= 0) {
			let  line = this.buffer_.substr(lastPos, lineTo - lastPos)
			console.log("Line "+line)
			this.processLine_(line)
			lastPos = lineTo + 1
		 	lineTo = this.buffer_.indexOf(kRecordSeparator, lastPos)
		}

		if (lastPos)
			this.buffer_ = this.buffer_.substr(lastPos)

		done()
	}

	processLine_(line) {
		let tm=[],
			signal=[],
			line_arr = line.split(/\s+/),
			head = line_arr[0],
			num_tm = line_arr[1],
			sp = line_arr[2],
			topology = line_arr[3]


			console.log("Header "+head + " Num of TM" + num_tm)

			if(num_tm > 0) {
				
				topology = topology.replace(/[o,i]/g,' ')
				let tm_arr = topology.trim().split(/\s+/),
					i=0

				for(i =0;i<tm_arr.length;i++) {
				
						let tm_pos = tm_arr[i].split('-')
						tm.push([tm_pos[0],tm_pos[1]])
				}					
			}

		console.log("TM ")
		console.log(tm)

		let results = [head,signal,tm]
		return this.push(results)
	}
}
