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
		'rest-api.html',
		'rest-errors.pug',
		'model-structures-intro.pug',
		'model-structures.html'
	],
	search: true,
	highlightTheme: 'agate',
	compress: false
}
