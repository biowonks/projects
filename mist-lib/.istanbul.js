'use strict'

// Core
const path = require('path')

module.exports = {
	instrumentation: {
		'include-all-sources': true,
		excludes: [
			'src/node_modules'
		]
	},
	reporting: {
		dir: 'testing/coverage'
	}
}
