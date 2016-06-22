'use strict'

// Vendor
let bunyan = require('bunyan')

// Constants
const kShutdownGracePeriodMs = 30000

let fallBackLogger = bunyan.createLogger({name: 'base worker logger'})

class BaseWorker {
	constructor() {
		this.shuttingDown_ = false
		this.numShutdownRequests_ = 0
		this.tearingDown_ = false
	}

	isShuttingDown() {
		return this.shuttingDown_
	}

	logger() {
		return fallBackLogger
	}

	shutdown() {
		this.logger().info('Shutdown request received')
		this.shuttingDown_ = true
		this.numShutdownRequests_++
		if (this.numShutdownRequests_ > 1) {
			this.logger().fatal('Multiple shutdown requests received. Forcefully shutting down')
			process.exit(1)
		}

		let failSafeTimer = setTimeout(() => {
			this.logger().fatal('Process did not exit within the grace period. Forcefully exiting.')
			process.exit(1)
		}, kShutdownGracePeriodMs)

		failSafeTimer.unref()
	}

	interruptCheck() {
		if (this.shuttingDown_)
			throw new BaseWorker.InterruptError()
	}

	// ----------------------------------------------------
	// Protected event handlers
	onTeardown_() {}

	// ----------------------------------------------------
	// Protected methods
	teardown_(optError) {
		if (this.tearingDown_)
			return Promise.resolve()

		this.logger().info('Tearing down')

		this.tearingDown_ = true
		return this.onTeardown_(optError)
	}
}

BaseWorker.InterruptError =
class InterruptError extends Error {
	constructor(optMessage) {
		super(optMessage || 'Process was interrupted')
	}
}

module.exports = BaseWorker
