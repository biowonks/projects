'use strict'

// Core
const assert = require('assert')

// Constants
const kNanosPerSec = 1000000000

module.exports =
class StopWatch {
	constructor() {
		this.t0_ = null
		this.delta_ = null
	}

	start() {
		this.t0_ = process.hrtime()
		this.delta_ = null
	}

	elapsedSeconds() {
		assert(this.t0_, 'please call start before calling elapsedSeconds()')
		return this.toSeconds_(this.delta_ || process.hrtime(this.t0_))
	}

	stop() {
		this.delta_ = process.hrtime(this.t0_)
	}

	toSeconds_(delta) {
		return delta[0] + delta[1] / kNanosPerSec
	}
}
