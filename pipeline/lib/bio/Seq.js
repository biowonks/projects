'use strict'

// Core
const assert = require('assert'),
	crypto = require('crypto')

// Local
const seqUtil = require('./seq-util')

// Constants
const kComplementaryBases = {
	A: 'T',
	C: 'G',
	G: 'C',
	T: 'A',
	U: 'A',
	R: 'Y',
	Y: 'R',
	K: 'M',
	M: 'K',
	B: 'V',
	D: 'H',
	H: 'D',
	V: 'B'
}

const kInvalidSymbol = '@'

// Create the equivalent lower case base complements
for (let base in kComplementaryBases)
	kComplementaryBases[base.toLowerCase()] = kComplementaryBases[base].toLowerCase()

/**
 * Surrounding spaces are removed; however, internal spaces are preserved unless the sequence
 * is normalized.
 *
 * @constructor
 * @param {string?} optSequence defauls to the empty string
 */
class Seq {
	constructor(optSequence = '') {
		this.sequence_ = optSequence.trim()
		this.isCircular_ = false
		this.isNormalized_ = false
		this.removeNonSpaceWhitespace_()
		this.clean_()
	}

	clone(otherSeq) {
		let newSeq = new Seq()
		newSeq.sequence_ = this.sequence_
		newSeq.isCircular_ = this.isCircular_
		newSeq.isNormalized_ = this.isNormalized_
		return newSeq
	}

	complement(optReverse) {
		let changingDirection = typeof optReverse === 'undefined' ? false : Boolean(optReverse),
			complementaryStrand = ''

		for (let i = 0, z = this.sequence_.length; i < z; i++) {
			let letter = changingDirection ? this.sequence_[z - i - 1] : this.sequence_[i]
			complementaryStrand += kComplementaryBases[letter] || letter
		}

		return new Seq(complementaryStrand)
	}

	/**
	 * Returns the FASTA sequence representation of this sequence. The sequence is split into lines
	 * with ${charsPerLine} characters per line.
	 *
	 * @param {Number?} charsPerLine defaults to 80
	 * @returns {String}
	 */
	fastaSequence(charsPerLine = Seq.kDefaultCharsPerLine) {
		assert(typeof charsPerLine === 'number', 'charsPerLine must be a number')
		return this.spliceNewlines_(charsPerLine)
	}

	gcPercent() {
		return seqUtil.gcPercent(this.sequence_)
	}

	invalidSymbol() {
		return kInvalidSymbol
	}

	isCircular() {
		return this.isCircular_
	}

	isEmpty() {
		return this.length() === 0
	}

	isValid() {
		return this.sequence_.indexOf(kInvalidSymbol) < 0
	}

	length() {
		return this.sequence_.length
	}

	normalize() {
		if (!this.isNormalized_) {
			this.sequence_ = this.normalizedSequence_()
			this.isNormalized_ = true
		}

		return this
	}

	reverseComplement() {
		return this.complement(true /* change direction */)
	}

	sequence() {
		return this.sequence_
	}

	seqId() {
		let md5base64 = crypto
			.createHash('md5')
			.update(this.normalizedSequence_())
			.digest('base64')
		return md5base64
			.replace(/=+/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
	}

	/**
	 * @param {boolean?} optCircular defaults to true
	 * @returns {Seq} instance that called this method
	 */
	setCircular(optCircular) {
		this.isCircular_ = typeof optCircular === 'undefined' ? true : !!optCircular
		return this
	}

	/**
	 * @param {number} start 1-based value
	 * @param {number} stop 1-based value
	 * @returns {Seq} new sequence object
	 */
	subseq(start, stop) {
		assert(start > 0, 'start must be positive')
		assert(stop > 0, 'stop must be positive')
		assert(start <= this.length(), 'start must be <= length')
		assert(stop <= this.length(), 'stop must be <= length')

		if (!this.isCircular_ || start <= stop) {
			assert(start <= stop, 'start must be <= stop on non-circular sequences')
			return new Seq(this.oneBasedSubstr_(start, stop))
		}

		// Circular sequence and the start is > stop
		return new Seq(this.oneBasedSubstr_(start, this.length()) + this.oneBasedSubstr_(1, stop))
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * Replaces all characters except for A-Z, a-z, ., -, *, or ' ' with the ampersand symbol
	 * @returns {undefined}
	 */
	clean_() {
		this.sequence_ = this.sequence_.replace(/[^A-Za-z.\-* ]/g, kInvalidSymbol)
	}

	/**
	 * Removes all spaces and upper-cases the sequence.
	 * @returns {string} normalized sequence string
	 */
	normalizedSequence_() {
		return this.isNormalized_ ? this.sequence_ : this.sequence_.replace(/ /g, '').toUpperCase()
	}

	/**
	 * @param {number} start 1-based value
	 * @param {number} stop 1-based value
	 * @returns {string} characters between ${start} and ${stop}
	 */
	oneBasedSubstr_(start, stop) {
		return this.sequence_.substr(start - 1, stop - start + 1)
	}

	removeNonSpaceWhitespace_() {
		this.sequence_ = this.sequence_.replace(/(\n|\r|\f|\t|\v)/g, '')
	}

	/**
	 * @param {number} charsPerLine number of sequence characters per line
	 * @returns {string}
	 */
	spliceNewlines_(charsPerLine) {
		assert(charsPerLine >= 0, 'charsPerLine must be 0 or a positive integer')
		if (!charsPerLine)
			return `${this.sequence_}\n`

		let result = ''
		for (let i = 0, z = this.sequence_.length; i < z; i += charsPerLine)
			result += `${this.sequence_.substr(i, charsPerLine)}\n`

		return result
	}
}

Seq.kDefaultCharsPerLine = 80
module.exports = Seq
