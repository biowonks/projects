'use strict'

// Core node libraries
let assert = require('assert'),
	crypto = require('crypto')

// Constants
let kComplementaryBases = {
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

let kInvalidSymbol = '@'

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
module.exports =
class Seq {
	constructor(optSequence) {
		this.sequence_ = (optSequence || '').trim()
		this.isCircular_ = false
		this.isNormalized_ = false
		this.removeNonSpaceWhitespace_()
		this.clean_()
	}

	complement(optReverse) {
		let changingDirection = optReverse === undefined ? false : optReverse,
			complementaryStrand = ''

		for (let i = 0, z = this.sequence_.length; i < z; i++) {
			let letter = changingDirection ? this.sequence_[z-i-1] : this.sequence_[i]
			complementaryStrand += kComplementaryBases[letter] || letter
		}

		return new Seq(complementaryStrand)
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
		return this.sequence_.indexOf(kInvalidSymbol) === -1
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
		let md5base64 = crypto.createHash('md5').update(this.normalizedSequence_()).digest('base64')
		return md5base64.replace(/=+/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
	}

	/**
	 * @param {boolean?} optCircular defaults to true
	 */
	setCircular(optCircular) {
		this.isCircular_ = optCircular === undefined ? true : !!optCircular
		return this
	}

	/**
	 * @param {number} start 1-based value
	 * @param {number} stop 1-based value
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
	 */
	clean_() {
		this.sequence_ = this.sequence_.replace(/[^A-Za-z.\-* ]/g, '@')
	}

	/**
	 * Removes all spaces and upper-cases the sequence. The result is cached.
	 */
	normalizedSequence_() {
		return this.isNormalized_ ? this.sequence_ : this.sequence_.replace(/ /g, '').toUpperCase()
	}

	/**
	 * @param {number} start 1-based value
	 * @param {number} stop 1-based value
	 * @returns {string}
	 */
	oneBasedSubstr_(start, stop) {
		return this.sequence_.substr(start - 1, stop - start + 1)
	}

	removeNonSpaceWhitespace_() {
		this.sequence_ = this.sequence_.replace(/(\n|\r|\f|\t|\v)/g, '')
	}
}
