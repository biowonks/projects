'use strict'

// Core
const path = require('path'),
	child_process = require('child_process') // eslint-disable-line camelcase

// Vendor
const pumpify = require('pumpify'),
	through2 = require('through2')

// Local
const config = require('../../../config'),
	fastaStream = require('./fasta-stream'),
	seqUtil = require('../bio/seq-util')

// Constants
const kSegToolDir = config.pipeline.vendor.seg.basePath,
	kSegToolFile = path.resolve(kSegToolDir, 'seg')

module.exports = function(file, options) {
	let segTool = child_process.spawn(kSegToolFile, [file, '-x']),
		segParser = through2.obj(options, (fastaSeq, encoding, done) => {
			done(null, {
				header: fastaSeq.header(),
				segs: seqUtil.parseMaskedRegions(fastaSeq.sequence())
			})
		})

	return pumpify.obj(segTool.stdout, fastaStream(true /* skip empty sequences */), segParser)
}
