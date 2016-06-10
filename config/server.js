'use strict'

// Core
let os = require('os')

module.exports = function() {
	return {
		host: process.env.HOST || '127.0.0.1',
		port: process.env.PORT || 7001, // eslint-disable-line no-magic-numbers
		cpus: os.cpus().length,
		restartAutomatically: true,
		restartGraceMs: 10000,		// Milliseconds to wait for open connections to finish before forcefully
									// closing them down

		// The following are derived automatically unless otherwise specified
		protocol: null,
		baseUrl: null
	}
}
