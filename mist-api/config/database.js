'use strict'

// Core
let path = require('path')

module.exports = function(rootPath, packageJSON) {
	return {
		enabled: true,

		// NOTE: The DATABASE_URL environment variable if defined will override these values.
		name: '',
		user: '',
		password: '',

		sequelizeOptions: {
			protocol: 'postgres',
			dialect: 'postgres',
			port: 5432,
			host: 'localhost',
			dialectOptions: {
				application_name: packageJSON.name,
				ssl: true
			},
			logging: false,
			pool: {
				maxConnections: 10,
				maxIdleTime: 1000
			}
		},

		migrations: {
			path: path.resolve(rootPath, 'db', 'migrations'),
			pattern: /^\d{4}_[\w-_]+\.sql$/
		}
	}
}
