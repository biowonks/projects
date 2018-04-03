'use strict'

// Core
let os = require('os')

// Constants
const kMaxCpus = 2,
	kWatchEnabled = !process.env.WATCH || process.env.WATCH !== 'false',
	kEnvWatchPaths = kWatchEnabled && process.env.WATCH ? process.env.WATCH.split(',') : null

module.exports = {
	// The following parameters are for the dockerized postgresql database
	database: {
		name: 'mist_dev',
		user: 'mist_dev_admin',
		password: '$&hxsALC!7_c',
		host: 'mist-pg-db'
	},

	server: {
		cpus: Math.min(kMaxCpus, os.cpus().length),
		watch: kWatchEnabled ? kEnvWatchPaths || [
			'app.js',
			'index.js',
			'package.json',
			'config',
			'lib',
			'models',
			'routing',
			'services'
		] : false
	}
}
