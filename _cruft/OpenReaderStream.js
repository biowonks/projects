/**
 * Stock reader streams typically involve reading a known quantity of data (e.g. files have a set
 * size). In some cases; however, data generated on the fly (e.g. generating subsets of data from
 * parsing a complex data source), is not handled so easily. OpenReaderStream provides a mechanism
 * to dynamically add more readable data to this streams buffer. Thus, this stream is "open" in the
 * sense that more data may be dynamically added for reading (until closeInput() is called; after
 * which it will throw an error if push is subsequently called).
 *
 * Additionally, calls to push return a promise that resolves when there the buffer has been
 * completely consumed. This facilitates handling back-pressure (e.g. slow writing to disk) without
 * having to resort to callbacks.
 *
 * An example of where this stream implementation is useful is when parsing GenBank data files.
 * GenBank records are complex conglomerates of data (replicon dna, taxonomy, protein sequences,
 * features, etc). The goal was to dissect this single source of conglomerate data into distinct
 * JSON files on demand. Specifically, all replicon / contig sequences (ORIGIN) is saved to one
 * file, sequences are saved to another, etc. And because all the data in these files is related
 * (e.g. identifiers), various logic is necessary to ensure accurate data generation (thus it was
 * not possible to simply pipe the GenBank data to multiple independent streams).
 */
'use strict'

// Core
let stream = require('stream')

// Local
let mutil = require('../mutil')

module.exports =
class OpenReaderStream extends stream.Readable {
	constructor(options) {
		super(options)
		this.buffer_ = ''
		this.inputClosed_ = false
		this.bytesRequested_ = 0
		this.deferreds_ = []
	}

	/**
	 * Pushes ${chunk} onto the internal buffer of data to be consumed and returns a Promise that is
	 * resolved when the entire buffer (including any previous and/or future additions) has been
	 * read.
	 *
	 * @param {String|Buffer} chunk
	 * @returns {Promise}
	 */
	push(chunk = null) {
		if (this.inputClosed_) {
			let error = new Error('Cannot push more data after closeInput() has been called')
			this.rejectDeferreds_()
			this.emit('error', error)
			return null
		}

		if (chunk === null || !chunk.length)
			return null

		this.buffer_ += chunk

		let deferred = mutil.createDeferred()
		this.deferreds_.push(deferred)

		if (this.bytesRequested_)
			this.processBuffer_()

		return deferred.promise
	}

	/**
	 * No longer accept input via the push method. If there is no data in the buffer and _read
	 * has been called, signals the stream to close by pushing null.
	 */
	closeInput() {
		this.inputClosed_ = true
		if (this.bytesRequested_ && !this.buffer_)
			this.push(null)
	}

	// ----------------------------------------------------
	// Overidded protected methods
	/**
	 * @param {Number} size
	 */
	_read(size) {
		this.bytesRequested_ += size
		this.processBuffer_()
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * Pushes ${this.bytesRequested_} of the buffer to downstream consumers. If afterward the buffer
	 * is empty, all deferreds are resolved and if input has been closed (via closeInput()), then
	 * the stream signals it is done by pushing null.
	 */
	processBuffer_() {
		if (this.buffer_.length) {
			let chunk = this.buffer_
			if (this.bytesRequested_ < this.buffer_.length) {
				chunk = this.buffer_.substr(0, this.bytesRequested_)
				this.buffer_ = this.buffer_.substr(this.bytesRequested_)
			}
			else {
				this.buffer_ = ''
			}

			this.bytesRequested_ = 0
			super.push(chunk)
		}
		else {
			if (this.inputClosed_)
				super.push(null)

			this.resolveDeferreds_()
		}
	}

	/**
	 * @param {Error} error
	 */
	rejectDeferreds_(error) {
		this.deferreds_.forEach((deferred) => deferred.reject(error))
		this.clearDeferreds_()
	}

	resolveDeferreds_() {
		this.deferreds_.forEach((deferred) => deferred.resolve())
		this.clearDeferreds_()
	}

	clearDeferreds_() {
		this.deferreds_.length = 0
	}
}
