#!/usr/bin/env node
/* eslint-disable no-console, no-magic-numbers */
'use strict'

let config = require('../config')

let jsonPaths = process.argv.slice(2)

jsonPaths.forEach((jsonPath) => {
	let parts = jsonPath.split('.'),
		ref = config

	for (let part of parts) {
		if (!ref[part]) {
			console.error(`Invalid configuration path ${part} of ${jsonPath}`)
			process.exit(1)
		}
		ref = ref[part]
	}

	console.log(ref)
})
