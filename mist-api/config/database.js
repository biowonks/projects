'use strict'

// Local
let loadDatabaseConfig = require('../src/node_modules/mist-lib/db/config'),
	packageJSON = require('../package.json')

module.exports = function() {
	return loadDatabaseConfig(packageJSON.name)
}
