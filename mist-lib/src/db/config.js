'use strict'

// Core
const path = require('path')

// Default database configuration.
module.exports = {
	schema: null,
	applicationName: null,

	// NOTE: The DATABASE_URL environment variable if defined will override these values.
	dialect: 'postgres',
	user: 'mist_dev_admin',
	password: '$&hxsALC!7_c',
	host: 'mist-pg-db', // docker-specific
	port: 5432,
	name: 'mist_dev',
	ssl: true,
	logging: false,

	models: {
		path: path.resolve(__dirname, '..', 'models')
	},

	migrations: {
		path: path.resolve(__dirname, 'migrations'),
		pattern: /^\d{4}_[\w-_\.]+\.sql$/
	},

	seqdepot: {
		schema: 'seqdepot',
		migrations: {
			path: path.resolve(__dirname, '..', 'node_modules', 'seqdepot-lib', 'db', 'migrations'),
			pattern: /^\d{4}_[\w-_]+\.sql$/,
			schema: 'seqdepot'
		},

		models: {
			path: path.resolve(__dirname, '..', 'node_modules', 'seqdepot-lib', 'models')
		}
	}
}
