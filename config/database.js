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
			define: {
				underscored: true,
				timestamps: true
			},
			pool: {
				maxConnections: 10,
				maxIdleTime: 1000
			}
		},

		migrations: {
			sqlPath: path.resolve(rootPath, 'db', 'migrations', 'sql'),

			// For all umzug options, see:
			// https://github.com/sequelize/umzug (configuration)
			umzug: {
				storage: 'sequelize',
				storageOptions: {
					modelName: 'migrations_meta'
				},
				migrations: {
					path: path.resolve(rootPath, 'db', 'migrations', 'js'),
					// Pattern is conceptualized into the following:
					// First 14 digits = timestamp (YYYYMMDDHHmmss)
					// Next 4 digits is a pseudo-serial number indicating the rough order of SQL migrations
					// This is followed by a couple of descriptive words
					pattern: /^\d{14}_\d{4}_[\w-_]+\.js$/
				}
			}
		}
	}
}
