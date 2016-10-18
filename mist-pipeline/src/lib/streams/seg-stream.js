'use strict'

// Core
const path = require('path')

// Vendor
const pumpify = require('pumpify'),
	through2 = require('through2'),
	duplexChildProcess = require('duplex-child-process')

// Local
const config = require('../../../config'),
	fastaStream = require('mist-lib/streams/fasta-stream'),
	seqUtil = require('core-lib/bio/seq-util'),
	streamMixins = require('mist-lib/streams/stream-mixins')

// Constants
const kSegToolDir = config.vendor.seg.basePath,
	kSegToolPath = path.resolve(kSegToolDir, 'seg')

module.exports = function(options) {
	let segTool = duplexChildProcess.spawn(kSegToolPath, ['-', '-x']),
		segParser = through2.obj(options, (fastaSeq, encoding, done) => {
			done(null, {
				header: fastaSeq.header(),
				segs: seqUtil.parseMaskedRegions(fastaSeq.sequence())
			})
		}),
		pipeline = pumpify.obj(segTool, fastaStream(true /* skip empty sequences */), segParser)

	streamMixins.all(pipeline)

	return pipeline
}
