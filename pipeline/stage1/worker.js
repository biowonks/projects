#!/usr/bin/env node

'use strict'

// Local
let Stage1Worker = require('./Stage1Worker')

// --------------------------------------------------------
let worker = new Stage1Worker()
worker.main()

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

function shutdown() {
	worker.shutdown()
}
