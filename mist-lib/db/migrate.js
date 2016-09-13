#!/usr/bin/env node

'use strict'

// Local
let BootService = require('../services/BootService'),
	loadDbConfig = require('./config')

// Other
let dbConfig = loadDbConfig('undo-migration')

let bootService = new BootService(dbConfig, {
	logger: {
		name: 'run-migrations'
	}
})

bootService.setup()
