/* eslint-disable global-require */
'use strict'

// Vendor
const loadConfig = require('node-config-loader')

// Local
const packageJSON = require('../package.json')

// Constants
/**
 * Environment names are based on the NODE_ENV environment variable.
 *
 * Recommended names for the environment:
 * 1. develop (assumed if NODE_ENV is undefined)
 * 2. boom (unstable build)
 * 3. staging (evaluation before pushing to production)
 * 4. production
 *
 * Following the recommended names is not required and may be set to whatever names are desired.
 *
 * Several configuration files may co-exist side by side and are merged in the following order
 * (precedence given to the modules loaded later):
 *
 * index.js
 * ${environment name}/index.js
 * local/index.js (not part of the repository)
 *
 * Finally, if any configuration is set via environment variables (e.g. DATABASE_URL),
 * that takes precedence over any configuration.
 */
const kEnvironmentName = process.env.NODE_ENV || 'develop'

let config = {
	cors: {
		enabled: true
	},

	responseTime: {
		enabled: true
	},

	debug: {
		errors: false	// If true, outputs error and stack to console
	},

	email: {

	},

	environment: {
		name: kEnvironmentName
	},

	headerNames: {
		apiToken: 'X-' + packageJSON.name + '-token',
		version: 'X-' + packageJSON.name + '-version'
	},

	package: packageJSON,

	signalTransduction: {
		// Version of st analysis results to return to user
		version: 1,
	}
}

loadConfig(__dirname, config)

// --------------------------------------------------------
function deriveApiBaseUrl() {
	if (!config.server.protocol)
		config.server.protocol = config.routing.ssl ? 'https' : 'http'

	if (!config.server.baseUrl) {
		let baseUrl = config.server.protocol + '://' + config.server.host
		if (config.server.port)
			baseUrl += ':' + config.server.port
		if (config.routing.prefix)
			baseUrl += config.routing.prefix

		config.server.baseUrl = baseUrl
	}
}
deriveApiBaseUrl()

// --------------------------------------------------------
module.exports = config
