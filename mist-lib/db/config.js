'use strict'

// Core
const assert = require('assert'),
	path = require('path')

module.exports = function(applicationName = 'app') {
	assert(typeof applicationName === 'string', 'application name must be a string')

	// Default database configuration.
	return {
		// NOTE: The DATABASE_URL environment variable if defined will override these values.
		dialect: 'postgres',
		user: 'mist_dev',
		password: '$&hxsALC!7_c',
		host: 'mist-local-db', // docker-specific
		port: 5432,
		name: 'mist_dev',

		sequelizeOptions: {
			// The following three properties should be transferred from the top-level configuration.
			// Currently, this is done in mist-sequelize.js
			dialect: null,
			host: null,
			port: null,
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
}
