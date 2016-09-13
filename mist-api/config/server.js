'use strict'

// Core
let os = require('os')

// Constants
const kDefaultMaxMemory = 512 // MB

module.exports = function() {
	return {
		host: process.env.HOST || '127.0.0.1',
		port: process.env.PORT || 5000, // eslint-disable-line no-magic-numbers
		cpus: os.cpus().length, // By default, use all available CPUs
		maxMemory: process.env.MAX_MEMORY || kDefaultMaxMemory,
		// Each worker has 25 seconds to close any open connections. This is to accommodate the
		// rule that all requests should not take longer than 30 seconds (imposed by Heroku) and
		// gives the master adequate time to perform its own cleanup.
		killTimeoutMs: 25000, // 25 seconds
		restartDelayMs: 500, // 1/2 second
		watch: false,

		// The following are derived automatically unless otherwise specified
		protocol: null,
		baseUrl: null
	}
}
