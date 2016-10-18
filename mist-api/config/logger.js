'use strict'

// Core
const assert = require('assert')

// Local
const packageJSON = require('../package.json')

module.exports = function() {
	let result = {
		// The following options are passed directly to bunyan when creating a logger
		options: {

			name: packageJSON.name,
			// Even though it is possible to specify a single stream per the bunyan docs, this
			// will break downstream components (e.g. BootStrapper) and is not permitted.
			streams: [
				{
					level: process.env.LOG_LEVEL || 'info',
					stream: process.stdout
				}
			]
		}
	}

	assert(!('stream' in result.options), 'Invalid logger configuration: stream property is not allowed. Please replace with the array format using the streams property. See: https://github.com/trentm/node-bunyan#streams')

	return result
}
