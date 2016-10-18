'use strict'

// Core
const path = require('path')

module.exports = {
	instrumentation: {
		'include-all-sources': true,
		excludes: [
			'src/node_modules'
		],
		root: 'src'
	},
	reporting: {
		dir: 'testing/coverage'
	}
}
