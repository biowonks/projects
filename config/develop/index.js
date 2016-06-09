'use strict'

// Core
let os = require('os')

// Constants
const kMaxCpus = 2

module.exports = {
	// The following parameters are for the local, dockerized postgresql database
	database: {
		name: 'mist_dev',
		user: 'mist_dev',
		password: '$&hxsALC!7_c',

		sequelizeOptions: {
			host: 'db'
		}
	},

	server: {
		cpus: Math.min(kMaxCpus, os.cpus().length)
	}
}
