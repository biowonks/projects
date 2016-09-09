'use strict'

// Core
const path = require('path')

// Default database configuration.
module.exports = {
	schema: null,
	applicationName: null,

	// NOTE: The DATABASE_URL environment variable if defined will override these values.
	dialect: 'postgres',
	user: 'mist_dev',
	password: '$&hxsALC!7_c',
	// host: 'mist-local-db', // docker-specific
	host: 'localhost', // docker-specific
	port: 5432,
	name: 'mist_dev',
	ssl: true,
	logging: false,

	sequelizeOptions: {
		// The following fiveproperties should be transferred from the top-level configuration.
		// Currently, this is done in mist-sequelize.js
		dialect: null,
		host: null,
		port: null,
		define: {
			schema: null
		},
		dialectOptions: {
			application_name: null,
			ssl: true
		},
		logging: false,
		pool: {
			maxConnections: 10,
			maxIdleTime: 1000
		}
	},

	models: {
		path: path.resolve(__dirname, '..', 'models')
	},

	migrations: {
		path: path.resolve(__dirname, 'migrations'),
		pattern: /^\d{4}_[\w-_]+\.sql$/
	},

	seqdepot: {
		schema: 'seqdepot',
		migrations: {
			path: path.resolve(__dirname, '..', 'node_modules', 'seqdepot-lib', 'db', 'migrations'),
			pattern: /^\d{4}_[\w-_]+\.sql$/
			// schema: 'seqdepot'
		},

		models: {
			path: path.resolve(__dirname, '..', 'node_modules', 'seqdepot-lib', 'models')
		}
	}
}
