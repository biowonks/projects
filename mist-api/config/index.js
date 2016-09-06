/* eslint-disable global-require */
'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const _ = require('lodash')

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
const kEnvironmentName = process.env.NODE_ENV || 'develop',
	kRootPath = path.resolve(__dirname, '..')

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

	package: packageJSON
}

// --------------------------------------------------------
function getConfigFileNames() {
	return fs.readdirSync(__dirname)
	.filter(function(configFileName) {
		return configFileName !== 'index.js' &&
			configFileName.endsWith('.js')
	})
	.sort()
}
getConfigFileNames()
.forEach((configFileName) => {
	let baseName = path.basename(configFileName, '.js')
	try {
		config[baseName] = require(`./${configFileName}`)(kRootPath, packageJSON)
	}
	catch (error) {
		// eslint-disable-next-line no-console
		console.error(`FATAL: Error loading configuration file, ${configFileName},`, error)
		process.exit(1)
	}
})

// --------------------------------------------------------
mergeOptionalConfigFile(`./${kEnvironmentName}`)
mergeOptionalConfigFile('./local')

function mergeOptionalConfigFile(configFile) {
	try {
		// eslint-disable-next-line global-require
		_.merge(config, require('./' + configFile))
	}
	catch (error) {
		if (error.code === 'MODULE_NOT_FOUND')
			return

		// Configuration file exists however, node encountered an error while attempting
		// to process it.
		throw error
	}
}

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
function parseDatabaseUrl() {
	if (!config.database.enabled)
		return

	let dbUrl = process.env.DATABASE_URL
	if (dbUrl) {
		// e.g. postgres://qwldzjjyuomgwv:xtCz9RZ4kFs7oGTEPAsPXtlvhY@ec2-54-225-124-205.compute-1.amazonaws.com:5432
		// /dchdh8q9npvppn
		//                 1------------| 2------------------------| 3----------------------------------------| 4--|
		// 5------------|
		let matches = dbUrl.match(/^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
		if (matches) {
			config.database.user = matches[1]
			config.database.password = matches[2]
			config.database.sequelizeOptions.host = matches[3]
			config.database.sequelizeOptions.port = matches[4]
			config.database.name = matches[5]
		}
		else {
			throw new Error('FATAL: Unable to parse environment variable, DATABASE_URL: ' + dbUrl)
		}
	}
}
parseDatabaseUrl()

// --------------------------------------------------------
module.exports = config
