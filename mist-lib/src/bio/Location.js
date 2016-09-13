'use strict'

// Core
const assert = require('assert')

// Local
const AbstractLocation = require('./AbstractLocation'),
	LocationPoint = require('./LocationPoint'),
	Seq = require('core-lib/bio/Seq')

module.exports =
class Location extends AbstractLocation {
	/**
	 * @param {LocationPoint} startLocationPoint starting point for this location
	 * @param {LocationPoint} stopLocationPoint stopping point for this location
	 * @param {string?} optAccession defaults to null if not a string
	 */
	constructor(startLocationPoint, stopLocationPoint, optAccession) {
		super()
		assert(startLocationPoint instanceof LocationPoint, 'startLocationPoint argument must be a LocationPoint instance')
		assert(stopLocationPoint instanceof LocationPoint, 'stopLocationPoint argument must be a LocationPoint instance')
		this.startLocationPoint_ = startLocationPoint
		this.stopLocationPoint_ = stopLocationPoint
		this.accession_ = typeof optAccession === 'string' ? optAccession : null
	}

	accession() {
		return this.accession_
	}

	lowerBound() {
		return this.startLocationPoint_.lowerBound()
	}

	upperBound() {
		return this.stopLocationPoint_.upperBound()
	}

	strand() {
		return '+'
	}

	transcriptFrom(seq) {
		assert(seq instanceof Seq, 'seq is not a valid Seq instance')
		assert(this.startLocationPoint_.hasDefiniteStart(), 'starting location point does not have definite start')
		assert(this.stopLocationPoint_.hasDefiniteStop(), 'stop location point does not have definite stop')
		assert(!this.accession_, 'transcripts from external accessions is not implemented')
		return seq.subseq(this.lowerBound(), this.upperBound())
	}
}
