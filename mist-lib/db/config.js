'use strict'

// Core
const assert = require('assert'),
	path = require('path')

module.exports = function(applicationName = 'app') {
	assert(typeof applicationName === 'string', 'application name must be a string')

	// Default database configuration.
	let config = {
		// NOTE: The DATABASE_URL environment variable if defined will override these values.
		name: 'mist_dev',
		user: 'mist_dev',
		password: '$&hxsALC!7_c',

		sequelizeOptions: {
			protocol: 'postgres',
			dialect: 'postgres',
			port: 5432,
			host: 'mist-local-db', // docker-specific
			dialectOptions: {
				application_name: applicationName,
				ssl: true
			},
			logging: false,
			pool: {
				maxConnections: 10,
				maxIdleTime: 1000
			}
		},

		migrations: {
			path: path.resolve(__dirname, 'migrations'),
			pattern: /^\d{4}_[\w-_]+\.sql$/
		}
	}

	config.$parseDatabaseUrl = (envVarName = 'DATABASE_URL') => {
		let dbUrl = process.env[envVarName]
		if (!dbUrl)
			return

		// e.g. postgres://qwldzjjyuomgwv:xtCz9RZ4kFs7oGTEPAsPXtlvhY@ec2-54-225-124-205.compute-1.amazonaws.com:5432
		// /dchdh8q9npvppn
		//                 1------------| 2------------------------| 3----------------------------------------| 4--|
		// 5------------|
		let matches = dbUrl.match(/^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
		if (matches) {
			config.user = matches[1]
			config.password = matches[2]
			config.sequelizeOptions.host = matches[3]
			config.sequelizeOptions.port = matches[4]
			config.name = matches[5]
		}
		else {
			throw new Error('FATAL: Unable to parse environment variable, DATABASE_URL: ' + dbUrl)
		}
	}

	return config
}
