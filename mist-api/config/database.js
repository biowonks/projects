'use strict'

// Local
let loadDatabaseConfig = require('../src/node_modules/mist-lib/db/config')

module.exports = function(rootPath, packageJSON) {
	return loadDatabaseConfig(packageJSON)
}
