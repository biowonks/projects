'use strict'

// Local
const mistApiConfig = require('../../config')

module.exports = {
	routesPath: mistApiConfig.routing.routesPath,
	baseUrl: mistApiConfig.server.baseUrl,
	languageTabs: [
		'bash',
		'javascript',
		'python',
		'ruby'
	],
	tocFooters: [],
	includes: [
		'main.pug',
		'rest-endpoints.html',
		'rest-errors.pug'
		// 'data-structures',
		// 'errors'
	],
	search: true,
	highlightTheme: 'agate',
	compress: false
}
