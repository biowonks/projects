'use strict'

// Core
const path = require('path'),
	child_process = require('child_process') // eslint-disable-line camelcase

// Vendor
const pumpify = require('pumpify')

// Local
let config = require('../../../config'),
	hmmscanResultStream = require('./hmmscan-result-stream')

// Constants
const kHmmscanPath = path.resolve(config.pipeline.vendor.hmmer3.binPath, 'hmmscan')

module.exports = function(hmmDatabaseFile, fastaFile, optZ) {
	let hmmscanArgs = ['--noali', '--cut_ga']
	if (optZ) {
		hmmscanArgs.push('-Z')
		hmmscanArgs.push(optZ)
	}
	hmmscanArgs.push(hmmDatabaseFile)
	hmmscanArgs.push(fastaFile)

	let hmmscanTool = child_process.spawn(kHmmscanPath, hmmscanArgs)

	return pumpify.obj(hmmscanTool.stdout, hmmscanResultStream())
}
