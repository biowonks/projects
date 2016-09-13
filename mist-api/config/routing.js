'use strict'

// Core
const path = require('path')

module.exports = function() {
	return {
		ssl: false,
		prefix: '/v1',
		middlewaresPath: path.resolve(__dirname, '..', 'src', 'middlewares'),
		routesPath: path.resolve(__dirname, '..', 'src', 'routes')
	}
}
