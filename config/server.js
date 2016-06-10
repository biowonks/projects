'use strict'

// Core
let os = require('os')

module.exports = function() {
	return {
		host: process.env.HOST || '127.0.0.1',
		port: process.env.PORT || 7001, // eslint-disable-line no-magic-numbers
		cpus: os.cpus().length, // By default, use all available CPUs
		restartAutomatically: true,
		restartDelayScaleFactor: 2, // Double the delay with each subsequent crash
		minRestartDelayMs: 100, // 1/10th of a second
		maxRestartDelayMs: 30000, // 30 seconds

		masterExitGraceMs: 30000, // 30 seconds

		// Each worker has 25 seconds to close any open connections. This is to accommodate the
		// rule that all requests should not take longer than 30 seconds (imposed by Heroku) and
		// gives the master adequate time to perform its own cleanup.
		workerExitGraceMs: 25000, 	// Milliseconds to wait for open connections to finish before
									// forcefully exiting

		// The following are derived automatically unless otherwise specified
		protocol: null,
		baseUrl: null
	}
}
