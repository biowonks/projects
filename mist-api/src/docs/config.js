'use strict'

// Core
const path = require('path')

module.exports = {
	routesDir: path.resolve(__dirname, '../routes'),
	languageTabs: [
		'bash',
		'javascript',
		'python',
		'ruby'
	],
	tocFooters: [],
	includes: [
		'main.pug',
		'rest-endpoints.html'
		// 'data-structures',
		// 'errors'
	],
	search: true,
	highlightTheme: 'agate',
	compress: false
}
