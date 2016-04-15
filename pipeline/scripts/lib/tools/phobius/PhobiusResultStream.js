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
	_transform(chunk, encoding, done) {
		this.buffer_ += this.decoder_.write(chunk)

		let lastPos = 0,
			lineTo = this.buffer_.indexOf(kRecordSeparator, lastPos)
				
		while (lineTo >= 0) {
			let line = this.buffer_.substr(lastPos, lineTo - lastPos)
			if (!this.isHeader_(line))
				this.processLine_(line)	
			lastPos = lineTo + 1
		 	lineTo = this.buffer_.indexOf(kRecordSeparator, lastPos)
		}

		if (lastPos)
			this.buffer_ = this.buffer_.substr(lastPos)

		done()
	}

	_flush(done) {
		// Allow empty lines
		if (!this.buffer_.length)
			return done()

		let line = '',
			lineTo = this.buffer_.indexOf(kRecordSeparator)

		if (lineTo !== -1)
			line = this.buffer_.substr(1, lineTo - 1)

		if (!this.isHeader_(line))
			this.processLine_(line)

		this.buffer_ = ''

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
	 *   header: '2CSK_N'
	 *   // sp is null if there is no signal peptide predicted
	 *	 sp: {
	 *	   stop: 37
	 *	   N: [1, 7],
	 *	   H: [8, 19],
	 *	   C: [20, 37]
	 *	 },
	 *   // tms is an empty array if no transmembrane regions are found
	 *	 tms: [
	 *		[155, 178]
	 *	 ]
	 * }
	 *
	 * An empty array is returned if no signal peptide or transmembrane exists.
	 *
	 * @param {string} maskedSequence
	 * @return {Object}
	 */
	processLine_(line) {
		let tms = [],
			signalPeptide = null,
			line_arr = line.split(/\s+/),
			header = line_arr[0],
			hasTransmembrane = Number(line_arr[1]) > 0,
			isSignalPeptide = line_arr[2] === 'Y',
			topology = line_arr[3]

		if (isSignalPeptide) {
			let matches = /n(\d+)\-(\d+)c(\d+)\/\d+(.*)/.exec(topology)
			if (!matches)
				// Ignore this line?
				return

			let hStart = Number(matches[1]),
				hStop = Number(matches[2]),
				spStop = Number(matches[3])

			signalPeptide = {
				// the start is implicitly at position 1
				stop: spStop,
				N: [1, hStart - 1],
				H: [hStart, hStop],
				C: [hStop + 1, spStop]
			}

			topology = matches[4]
		}

		if (hasTransmembrane) {
			let tmSegments = topology.replace(/[o,i]/g,' ').trim().split(/\s+/)
			tmSegments.forEach((tmSegment) => {
				let span = tmSegment.split('-')
				tms.push([
					Number(span[0]),
					Number(span[1])
				])
			})
		}

		return this.push({
			header: header,
			sp: signalPeptide,
			tms: tms
		});
	}

	isHeader_(line) {
		return /SEQENCE\s+ID\s+TM\sSP\sPREDICTION/.test(line)
	}
}
