'use strict'

module.exports = {
	// The following parameters are for the local, dockerized postgresql database
	database: {
		name: 'mist_dev',
		user: 'mist_dev',
		password: '$&hxsALC!7_c',

		sequelizeOptions: {
			host: 'db'
		}
	}
}
