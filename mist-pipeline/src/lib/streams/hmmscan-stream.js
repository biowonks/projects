'use strict'

// Core
const fs = require('fs')
const path = require('path')
const child_process = require('child_process') // eslint-disable-line camelcase

// Vendor
const pumpify = require('pumpify')
const duplexChildProcess = require('duplex-child-process')

// Local
const config = require('../../../config')
const hmmscanResultStream = require('./hmmscan-result-stream')
const streamMixins = require('mist-lib/streams/stream-mixins')

// Constants
const kHmmscanPath = path.resolve(config.vendor.hmmer3.binPath, 'hmmscan')

/**
 * @param {String} hmmDatabaseFile - path to source hmm database file
 * @param {Array.<String>} args - array of string arguments (flags) to use when running hmmscan;
 * 	defaults to an empty array
 * @returns {DuplexStream} - expects FASTA input to be stream as input
 */
module.exports = function(hmmDatabaseFile, args = []) {
  if (!fs.existsSync(hmmDatabaseFile))
		throw new Error(`FATAL: hmmscan target database, ${hmmDatabaseFile}, does not exist`)

	const hmmscanTool = duplexChildProcess.spawn(kHmmscanPath, [...args, hmmDatabaseFile, '-'])
	const parser = hmmscanResultStream()
	const pipeline = pumpify.obj(hmmscanTool, parser)

	pipeline.tool = hmmscanTool

	streamMixins.all(pipeline)

	return pipeline
}

/**
 * @param {String} hmmDatabaseFile - path to source hmm database file
 * @param {String} [fastaFile='-'] - path to fasta file to run hmmer against; defaults to '-' (STDIN)
 * @param {Array<String>} args - array of string arguments (flags) to use when running hmmscan;
 * 	defaults to an empty array
 * @returns {Stream}
 */
module.exports.file = function(hmmDatabaseFile, fastaFile, args = []) {
  if (!fs.existsSync(hmmDatabaseFile))
    throw new Error(`FATAL: hmmscan target database, ${hmmDatabaseFile}, does not exist`)

	if (typeof fastaFile !== 'string')
		throw new Error('fastaFile argument must be a string')

	const hmmscanTool = child_process.spawn(kHmmscanPath, [...args, hmmDatabaseFile, fastaFile])
	return pumpify.obj(hmmscanTool.stdout, hmmscanResultStream())
}
