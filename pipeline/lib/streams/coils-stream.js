'use strict'

// Core
const path = require('path')

// Vendor
const pumpify = require('pumpify'),
	through2 = require('through2'),
	duplexChildProcess = require('duplex-child-process')

// Local
const config = require('../../../config'),
	fastaStream = require('./fasta-stream'),
	seqUtil = require('../bio/seq-util'),
	streamMixins = require('./stream-mixins')

// Constants
const kCoilsToolDir = config.pipeline.vendor.coils.basePath,
	kCoilsToolFile = path.resolve(kCoilsToolDir, 'ncoils')

module.exports = function(options) {
	let coilsTool = duplexChildProcess.spawn(kCoilsToolFile, ['-f'], {
			env: {
				COILSDIR: kCoilsToolDir
			}
		}),
		coilsParser = through2.obj(options, (fastaSeq, encoding, done) => {
			done(null, {
				header: fastaSeq.header(),
				coils: seqUtil.parseMaskedRegions(fastaSeq.sequence())
			})
		}),
		pipeline = pumpify.obj(coilsTool, fastaStream(true /* skip empty sequences */), coilsParser)

	streamMixins.all(pipeline)

	return pipeline
}
