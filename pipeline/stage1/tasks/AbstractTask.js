'use strict'

// Vendor
const Promise = require('bluebird')

module.exports =
class AbstractTask {
	constructor(queuedGenome, context) {
		this.queuedGenome_ = queuedGenome
		this.context_ = context
		this.interruptCheck = context.interruptCheck
		this.fileMapper_ = context.fileMapper
		this.config_ = context.config
		this.logger_ = context.logger
	}

	setup() {
		return Promise.resolve()
	}

	/**
	 * @returns {Promise.<Boolean>}
	 */
	isAlreadyDone() {
		return Promise.resolve(false)
	}

	run() {
		throw new Error('not yet implemented')
	}

	teardown() {
		return Promise.resolve()
	}
}
