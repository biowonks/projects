'use strict'

// Core
const assert = require('assert')
const EventEmitter = require('events')

// Vendor
const Promise = require('bluebird')

// Local
const StopWatch = require('mist-lib/services/StopWatch')

module.exports =
class AbstractToolRunner extends EventEmitter {
	/**
	 * This base class encapsulates bootstrapping details of running a particular tool and emitting
	 * progress events (enabled if ${config.ticksPerProgressEvent} is a positive number).
	 *
	 * @constructor
	 * @param {Object} config - tool runner specific configuration
	 * @param {Object.<string,Model>} models list of database models
	 */
	constructor(config, models) {
		super()
		this.config_ = config || {}
		this.models_ = models

		// Progress
		this.ticksPerProgressEvent_ = config.ticksPerProgressEvent || 0
		this.progressEnabled_ = this.ticksPerProgressEvent_ > 0
		this.stopWatch_ = new StopWatch()
		this.completedAseqs_ = 0
		this.totalAseqs_ = null
		this.ticksSinceLastEvent_ = 0

		assert(this.ticksPerProgressEvent_ >= 0, '(config) ticksPerProgressEvent must be falsy or >= 0')
	}

	/**
	 * @returns {Boolean} - true if this tool runner is enabled; false otherwise. See Tmhmm2ToolRunner for an example of how this may be false
	 */
	static isEnabled() {
		return true
	}

	/**
	 * If ${aseqs} is empty, immediately resolves. This sidesteps some issues with tools that bork
	 * if nothing is written to STDIN (because there are no aseqs) such as occurs with hmmscan.
	 *
	 * This method is not intended to be overrided by
	 * child classes as it abstracts the progress event logic and immediate resolving if ${aseqs} is
	 * empty. Rather, this method calls the protected method, onRun(), which is intended to be
	 * implemented by child classes.
	 *
	 * @param {Array.<Aseq>} aseqs - input seqs to process with this tool
	 * @returns {Promise}
	 */
	run(aseqs) {
		if (!aseqs.length)
			return Promise.resolve(aseqs)

		this.totalAseqs_ = aseqs.length
		this.stopWatch_.start()
		return this.onRun_(aseqs)
		.then((result) => {
			this.stopWatch_.stop()
			this.completedAseqs_ = this.totalAseqs_

			// Emit the final progress event if it has not already been emitted
			if (this.ticksSinceLastEvent_)
				this.emitProgressEvent_()

			return result
		})
	}

	// ----------------------------------------------------
	// Protected methods
	setup_() {
		return Promise.resolve()
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Virtual protected method that must be defined in the child class implementation.
	 *
	 * @param {Array.<Aseq>} aseqs
	 * @returns {Promise}
	 */
	onRun_(aseqs) {
		throw new Error('not implemented')
	}

	/**
	 * Virtual protected method for indicating how many aseqs have been processed. A progress event
	 * is emitted if the number completed since the last progress event is greater than or equal to
	 * ${config.ticksPerProgressEvent}.
	 *
	 * @param {Number} [amount = 1] - number of aseqs that have been processed
	 */
	tick_(amount = 1) {
		this.completedAseqs_ += amount
		this.ticksSinceLastEvent_ += amount
		if (this.progressEnabled_ && this.ticksSinceLastEvent_ >= this.ticksPerProgressEvent_)
			this.emitProgressEvent_()
	}

	// ----------------------------------------------------
	// Private methods
	emitProgressEvent_() {
		if (!this.progressEnabled_)
			return

		let elapsedSeconds = this.stopWatch_.elapsedSeconds()

		this.emit('progress', {
			toolId: this.constructor.meta.id,
			completed: this.completedAseqs_,
			total: this.totalAseqs_,
			percent: this.percentComplete_(),
			averagePerSecond: this.completedAseqs_ / elapsedSeconds,
			elapsedSeconds
		})

		this.ticksSinceLastEvent_ = 0
	}

	/**
	 * Note: this returns 100 if both completed and total aseqs are zero.
	 *
	 * @returns {Number}
	 */
	percentComplete_() {
		if (this.totalAseqs_ === 0 && this.completedAseqs_ === 0)
			return 100. // eslint-disable-line no-magic-numbers

		if (this.totalAseqs_ === 0)
			return 0.

		return this.completedAseqs_ / this.totalAseqs_ * 100. // eslint-disable-line no-magic-numbers
	}
}

/**
 * Template metadata to follow when describing this tool runner.
 */
module.exports.meta = {
	hidden: false,			// If this tool runner should be displayed as part of the AseqCompute.
											// Usually true; however in some cases such as the StpiToolRunner
											// which runs as part of the Stpi module, this property is true.
	id: null,						// Unique string identifying this tool
	dependencies: [],		// Flat module id
	description: null,
	requiredAseqFields: [],	// Extra fields that should be fetched when retrieving Aseqs
}
