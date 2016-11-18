'use strict'

// Core
const fs = require('fs'),
	path = require('path'),
	spawn = require('child_process').spawn

// Vendor
const pumpify = require('pumpify'),
	duplexify = require('duplexify')

// Local
const config = require('../../../config'),
	tmhmm2ResultStream = require('./tmhmm2-result-stream'),
	streamMixins = require('mist-lib/streams/stream-mixins')

// Constants
const kTMHMM2ToolFile = path.resolve(config.vendor.tmhmm2.binPath, 'decodeanhmm.Linux_x86_64'),
	kTMHMM2ModelFile = path.resolve(config.vendor.tmhmm2.libPath, 'TMHMM2.0.model'),
	kTMHMM2OptionsFile = path.resolve(config.vendor.tmhmm2.libPath, 'TMHMM2.0.options')

// Other
let tmhmm2IsInstalled = null

/**
 * TMHMM2 seems to always exit with a non-zero error code even when all runs as expected. Go
 * figure. This disrupts the normal processing by the node-module duplex-child-process such
 * as how it is coded up in hmmscan-stream. To workaround this problem, we use duplexify on
 * a spawned child_process to encapsulate the stdin and stdout pipes.
 *
 * @param {Object} options
 * @returns {Object}
 */
module.exports = function(options) {
	let tmhmm2Tool = spawn(kTMHMM2ToolFile, [
			kTMHMM2ModelFile,
			'-f',
			kTMHMM2OptionsFile,
			'-plp'
		]),
		duplexProcess = duplexify(tmhmm2Tool.stdin, tmhmm2Tool.stdout),
		parser = tmhmm2ResultStream(),
		pipeline = pumpify.obj(duplexProcess, parser)

	streamMixins.all(pipeline)

	return pipeline
}

module.exports.tmhmm2IsInstalled = function() {
	if (tmhmm2IsInstalled === null)
		tmhmm2IsInstalled = filesExist(kTMHMM2ToolFile, kTMHMM2ModelFile, kTMHMM2OptionsFile)

	return tmhmm2IsInstalled
}

function filesExist(...files) {
	try {
		files.forEach((file) => fs.accessSync(file))
	}
	catch (error) {
		return false
	}

	return true
}
