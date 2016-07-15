#!/usr/bin/env node

'use strict'

// Local
let BootService = require('../services/BootService')

let bootService = new BootService({
	logger: {
		name: 'run-migrations'
	}
})

bootService.setup()
