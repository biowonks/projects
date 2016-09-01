'use strict'

// Core
const path = require('path')

module.exports = function(kRootPath) {
	return {
		ssl: false,
		prefix: '/v1',
		middlewaresPath: path.resolve(kRootPath, 'routing', 'middlewares'),
		routesPath: path.resolve(kRootPath, 'routing', 'routes')
	}
}
