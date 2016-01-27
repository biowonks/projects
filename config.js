'use strict';

var _ = require('lodash'),
	os = require('os'),
	path = require('path');

var packageJSON = require('./package.json');

/**
 * Environment names are based on the NODE_ENV environment variable.
 *
 * Recommended names for the environment:
 * 1. develop (assumed if NODE_ENV is undefined)
 * 2. boom (unstable build)
 * 3. staging (evaluation before pushing to production)
 * 4. production
 *
 * Following the recommended names is not required and may be set to whatever
 * names are desired.
 *
 * Several configuration files may co-exist side by side and are merged in
 * the following order (precedence given to the modules loaded later):
 *
 * config.js
 * config.${environment name}.js
 * config.local.js (not saved into the repository)
 *
 * Finally, if any configuration is set via environment variables (e.g. DATABASE_URL),
 * that takes precedence over any configuration.
 */
var environmentName = process.env.NODE_ENV || 'develop';

var config = {
	analytics: {
		gaTrackingId: null,
		beaconImageFile: path.resolve(__dirname, 'assets', 'img', 'beacon.gif')
	},

	cors: {
		enabled: false
	},

	database: {
		enabled: true,

		// NOTE: The DATABASE_URL environment variable if defined will override
		// these values.
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
		}
	},

	debug: {
		errors: false	// If true, outputs error and stack to console
	},

	email: {

	},

	environment: {
		name: environmentName
	},

	headerNames: {
		apiToken: 'x-' + packageJSON.name + '-api-token',
		version: 'x-' + packageJSON.name + '-api-version'
	},

	logger: {
		options: {
			name: packageJSON.name,
			stream: process.stdout,
			level: process.env.LOG_LEVEL || 'info'
		}
	},

	package: packageJSON,

	routing: {
		ssl: false,
		prefix: '/api/v1'
	},

	server: {
		host: process.env.HOST || '127.0.0.1',
		port: process.env.PORT || 7001,
		cpus: os.cpus().length,
		restartOnCrash: true,
		restartGraceMs: 10000,		// Milliseconds to wait for open connections to finish before forcefully
									// closing them down

		// The following are derived automatically unless otherwise specified
		protocol: null,
		baseUrl: null
	},

	migrations: {
		// For all umzug options, see:
		// https://github.com/sequelize/umzug (configuration)
		umzug: {
			storage: 'sequelize',
			storageOptions: {
				modelName: 'sequelize_meta'
			},
			migrations: {
				path: path.resolve(__dirname, 'db', 'migrations')
			}
		}
	}
};

// --------------------------------------------------------
mergeOptionalConfigFile('config.' + environmentName);
mergeOptionalConfigFile('config.local');

function mergeOptionalConfigFile(configFile) {
	try {
		_.merge(config, require('./' + configFile));
		// console.log('[Merged configuration]', configFile);	// eslint-disable-line no-console
	}
	catch(error) {
		if (error.code === 'MODULE_NOT_FOUND')
			return;

		// Configuration file exists; however, node encountered an error while attempting
		// to process it.
		throw error;
	}
}

// --------------------------------------------------------
(function deriveApiBaseUrl() {
	if (!config.server.protocol)
		config.server.protocol = config.routing.ssl ? 'https' : 'http';

	if (!config.server.baseUrl) {
		var baseUrl = config.server.protocol + '://' + config.server.host;
		if (config.server.port)
			baseUrl += ':' + config.server.port;
		if (config.routing.prefix)
			baseUrl += config.routing.prefix;

		config.server.baseUrl = baseUrl;
	}
})();

// --------------------------------------------------------
(function parseDatabaseUrl() {
	if (!config.database.enabled)
		return;

	var dbUrl = process.env.DATABASE_URL;
	if (dbUrl) {
		// e.g. postgres://qwldzjjyuomgwv:xtCz9RZ4kFs7oGTEPAsPXtlvhY@ec2-54-225-124-205.compute-1.amazonaws.com:5432
		// /dchdh8q9npvppn
		//                 1------------| 2------------------------| 3----------------------------------------| 4--|
		// 5------------|
		var matches = dbUrl.match(/^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
		if (matches) {
			config.database.user = matches[1];
			config.database.password = matches[2];
			config.database.sequelizeOptions.host = matches[3];
			config.database.sequelizeOptions.port = matches[4];
			config.database.name = matches[5];
		}
		else {
			throw new Error('FATAL: Unable to parse environment variable, DATABASE_URL: ' + dbUrl);
		}
	}
})();

// --------------------------------------------------------
module.exports = config;
