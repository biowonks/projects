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
			lineTo = this.buffer_.indexOf(kRecordSeparator)

		if (lineTo !== -1) {
			line = this.buffer_.substr(1, lineTo - 1)
		}

		if(!(line.match(/SEQENCE\s+ID\s+TM\sSP\sPREDICTION/))) {
			this.processLine_(line)
		}

		this.buffer_ = ''

		done()
	}

	_transform(chunk, encoding, done) {
		this.buffer_ += this.decoder_.write(chunk)

		let lastPos = 0,
			lineTo = this.buffer_.indexOf(kRecordSeparator, lastPos)
				
		while (lineTo >= 0) {
			let  line = this.buffer_.substr(lastPos, lineTo - lastPos)
			if(!(line.match(/SEQENCE\s+ID\s+TM\sSP\sPREDICTION/))) {
				this.processLine_(line)	
			}
			lastPos = lineTo + 1
		 	lineTo = this.buffer_.indexOf(kRecordSeparator, lastPos)
		}

		if (lastPos)
			this.buffer_ = this.buffer_.substr(lastPos)

		done()
	}

	/**
	 * Parse header, signal peptide and transmembrane regions from Phobius output
	 * returns an array of header, signal peptide, number of TM  and 1-based start / stop positions of each TM region.
	 *
	 * Example:
	 * 2CSK_N                          1  Y n8-19c37/38o155-178i
	 * returns
	 * {
	 *	header: 2CSK_N
	 *	sigP: { 
	 *		sp: [1, 37],
	 *		N: [1, 7],
	 *		H: [8, 19],
	 *		C: [20, 37]
	 *	},
	 *	numTM: 1,
	 *	tms: [
	 *		[155, 178]
	 *	]
	 *}
	 *
	 * An empty array is returned if no singal prptide or TM exist.
	 *
	 * @param {string} maskedSequence
 	*/

	processLine_(line) {
		let tms=[],
			sigP = new Object(),
			line_arr = line.split(/\s+/),
			header = line_arr[0],
			numTM = parseInt(line_arr[1]),
			isSigP = line_arr[2],
			topology = line_arr[3]

		if(isSigP === 'Y') {
			let re = /n(\d+)\-(\d+)c(\d+)\/\d+(.*)/,
				matchArr = topology.match(re),
				hStart = parseInt(matchArr[1]), 
				hStop = parseInt(matchArr[2]),
				sigPStop = parseInt(matchArr[3])
			
				sigP['sp'] = [1, sigPStop]	
				sigP['N'] = [1, hStart - 1]
				sigP['H'] = [hStart, hStop]
				sigP['C'] = [hStop + 1, sigPStop]

				topology = matchArr[4]


		}

		if(numTM > 0) {
			topology = topology.replace(/[o,i]/g,' ')
			let tm_arr = topology.trim().split(/\s+/),
				i=0

			for(i =0; i < tm_arr.length; i++) {
				let tm_pos = tm_arr[i].split('-')
				tms.push([parseInt(tm_pos[0]), parseInt(tm_pos[1])])
			}
		}

		return this.push({
				header: header,
				sigP: sigP,
				numTM: numTM,
				tms: tms
		});
	}
}
