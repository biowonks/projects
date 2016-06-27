'use strict'

// Core
const assert = require('assert'),
	stream = require('stream'),
	StringDecoder = require('string_decoder').StringDecoder

// Vendor
const split = require('split'),
	pumpify = require('pumpify')

// Constants
const kNumberOfDomainFields = 17

/**
 * HmmscanResultReaderStream parses the textual output from the HMMER3 hmmscan tool
 * and streams out all the domain hits for each query sequence.
 *
 * By extending from LineStream, the input is processed line by line in a streaming
 * fashion for optimal performance.
 */
class HmmscanResultStream extends stream.Transform {
	constructor(options = {}) {
		options.objectMode = true
		super(options)
		this.decoder_ = new StringDecoder('utf8')
		this.reset_()
	}

	_transform(rawLine, encoding, done) {
		let line = this.decoder_.write(rawLine)

		if (this.skipRemainingLines_) {
			let lineIsRecordSeparator = line[0] === '/' && line[1] === '/'
			if (lineIsRecordSeparator) {
				this.sortDomainsByConditionalEvalue_()
				this.checkResultAndPush_()
				this.reset_()
			}
			done()
			return
		}

		if (!line || this.isComment_(line)) {
			done()
			return
		}

		if (/^Query:\s/.test(line))
			this.parseHeader_(line)
		else if (line[0] === '>' && line[1] === '>')
			this.parseDomainName_(line)
		else if (/^\s+\d+\s+!/.test(line))
			this.parseDomainHit_(line)
		else if (/^Internal pipeline statistics/.test(line))
			this.skipRemainingLines_ = true

		done()
	}

	// ----------------------------------------------------
	// Private methods
	checkResultAndPush_() {
		if (!this.queryName_)
			throw new Error('Missing sequence name')

		if (!this.queryLength_)
			throw new Error('Missing sequence length')

		this.push({
			queryName: this.queryName_,
			queryLength: this.queryLength_,
			domains: this.domains_
		})
	}

	isComment_(line) {
		return line[0] === '#'
	}

	parseHeader_(line) {
		let matches = /^Query:\s+(\S+)\s+\[L=(\d+)\]/.exec(line)
		if (!matches)
			throw new Error('Error while parsing header from query line')

		this.queryName_ = matches[1]
		this.queryLength_ = parseInt(matches[2])
	}

	parseDomainName_(line) {
		let matches = /^>>\s+(\S+)/.exec(line)
		if (!matches)
			throw new Error('Error while parsing domain name')

		this.currentDomainName_ = matches[1]
	}

	parseDomainHit_(line) {
		let dMatch = line.split(/\s+/)
		assert(dMatch.length === kNumberOfDomainFields, `Expected ${kNumberOfDomainFields} elements of data (line: ${line})`)

		this.domains_.push({
			name: this.currentDomainName_,
			score: parseFloat(dMatch[3]),
			bias: parseFloat(dMatch[4]),
			c_evalue: parseFloat(dMatch[5]),
			i_evalue: parseFloat(dMatch[6]),
			hmm_from: parseInt(dMatch[7]),
			hmm_to: parseInt(dMatch[8]),
			hmm_cov: dMatch[9],
			ali_from: parseInt(dMatch[10]),
			ali_to: parseInt(dMatch[11]),
			ali_cov: dMatch[12],
			env_from: parseInt(dMatch[13]),
			env_to: parseInt(dMatch[14]),
			env_cov: dMatch[15],
			acc: parseFloat(dMatch[16])
		})
	}

	reset_() {
		this.queryName_ = null
		this.queryLength_ = null
		this.currentDomainName_ = null
		this.domains_ = []
		this.skipRemainingLines_ = false
	}

	sortDomainsByConditionalEvalue_() {
		this.domains_.sort((a, b) => {
			if (a.c_evalue > b.c_evalue)
				return 1
			else if (b.c_evalue > a.c_evalue)
				return -1

			return 0
		})
	}
}

module.exports = function(options) {
	return pumpify.obj(split(), new HmmscanResultStream(options))
}
