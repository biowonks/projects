#!/usr/bin/env node

/**
 * Master script for managing one or more parallel stage 1 instances and tracking their state.
 *
 * Configuration is kept in config.stage1.manager
 */

'use strict'

// Core node libraries
let cluster = require('cluster')

// 3rd-party libraries
let program = require('commander'),
	bunyan = require('bunyan')

// Local includes
let config = require('../../config'),
	Stage1Master = require('./Stage1Master'),
	Stage1Worker = require('./Stage1Worker')

program
.description('Manages a set of parallel stage 1 workers for processing new genomes into MiST3')
.parse(process.argv)

let logger = bunyan.createLogger({name: 'stage1'})

if (cluster.isMaster) {
	let stage1Master = new Stage1Master(config, cluster, logger)

	process.on('SIGINT', () => {
		stage1Master.halt()
	})
	process.on('uncaughtException', (err) => {
		logger.fatal('Uncaught fatal exception', err, err.stack)
		stage1Master.halt()
	})

	stage1Master.main()
}

// eslint-disable-next-line curly
if (cluster.isWorker) {
	// The worker is launched via messaging from the master
	// eslint-disable-next-line no-unused-vars
	let stage1Worker = new Stage1Worker(config, logger)
}
