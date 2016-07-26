'use strict'

// Core
const path = require('path'),
	child_process = require('child_process') // eslint-disable-line camelcase

// Vendor
const pumpify = require('pumpify'),
	duplexChildProcess = require('duplex-child-process')

// Local
let config = require('../../../config'),
	hmmscanResultStream = require('./hmmscan-result-stream'),
	streamMixins = require('./stream-mixins')

// Constants
const kHmmscanPath = path.resolve(config.pipeline.vendor.hmmer3.binPath, 'hmmscan')

/**
 * @param {String} hmmDatabaseFile - path to source hmm database file
 * @param {Number} [z=null] - number of HMMs in hmmDatabaseFile by which to calculate the resulting E_values
 * @returns {DuplexStream} - expects FASTA input to be stream as input
 */
module.exports = function(hmmDatabaseFile, z = null) {
	let hmmscanTool = duplexChildProcess.spawn(kHmmscanPath, hmmscanArgs(hmmDatabaseFile, '-', z)),
		parser = hmmscanResultStream(),
		pipeline = pumpify.obj(hmmscanTool, parser)

	streamMixins.all(pipeline)

	return pipeline
}

/**
 * @param {String} hmmDatabaseFile - path to source hmm database file
 * @param {String} [fastaFile='-'] - path to fasta file to run hmmer against; defaults to '-' (STDIN)
 * @param {Number} [z=null] - number of HMMs in hmmDatabaseFile by which to calculate the resulting E_values
 * @returns {Stream}
 */
module.exports.file = function(hmmDatabaseFile, fastaFile, z = null) {
	if (typeof fastaFile !== 'string')
		throw new Error('fastaFile argument must be a string')

	let hmmscanTool = child_process.spawn(kHmmscanPath, hmmscanArgs(hmmDatabaseFile, fastaFile, z))
	return pumpify.obj(hmmscanTool.stdout, hmmscanResultStream())
}

/**
 * @param {String} hmmDatabaseFile - path to source hmm database file
 * @param {String} [fastaFile='-'] - path to fasta file to run hmmer against; defaults to '-' (STDIN)
 * @param {Number} [z=null] - number of HMMs in hmmDatabaseFile by which to calculate the resulting E_values
 * @returns {Array.<String>} - arguments to pass to hmmscan
 */
function hmmscanArgs(hmmDatabaseFile, fastaFile = '-', z = null) {
	let args = ['--noali', '--cut_ga']
	if (z) {
		args.push('-Z')
		args.push(z)
	}
	args.push(hmmDatabaseFile)
	args.push(fastaFile)
	return args
}
