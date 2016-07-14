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
	seqUtil = require('../bio/seq-util')

// Constants
const kSegToolDir = config.pipeline.vendor.seg.basePath,
	kSegToolFile = path.resolve(kSegToolDir, 'seg')

module.exports = function(options) {
	let segTool = duplexChildProcess.spawn(kSegToolFile, ['-', '-x']),
		segParser = through2.obj(options, (fastaSeq, encoding, done) => {
			done(null, {
				header: fastaSeq.header(),
				segs: seqUtil.parseMaskedRegions(fastaSeq.sequence())
			})
		})

	return pumpify.obj(segTool, fastaStream(true /* skip empty sequences */), segParser)
}
