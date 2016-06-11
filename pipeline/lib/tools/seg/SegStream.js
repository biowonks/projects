'use strict'

// Core node libraries
let assert = require('assert'),
	child_process = require('child_process'), // eslint-disable-line camelcase
	path = require('path'),
	Transform = require('stream').Transform

// Local includes
let config = require('../../../../config'),
	FastaReaderStream = require('../../streams/FastaReaderStream'),
	seqUtil = require('../../bio/seq-util')

// Constants
const kSegToolDir = config.pipeline.vendor.seg.basePath,
	kSegToolFile = path.resolve(kSegToolDir, 'seg')

module.exports =
class SegStream extends Transform {
	constructor(file) {
		assert(typeof file === 'string', 'Missing file argument')

		super({objectMode: true})

		this.segProcess_ = child_process.spawn(kSegToolFile, [file, '-x'])
		this.segProcess_.on('error', (error) => {
			this.emit('error', error)
		})

		this.fastaReaderStream_ = new FastaReaderStream(true)
		this.fastaReaderStream_.pipe(this)

		this.segProcess_.stdout.pipe(this.fastaReaderStream_)
	}

	_transform(fastaSeq, buffer, done) {
		this.push({
			header: fastaSeq.header(),
			segs: seqUtil.parseMaskedRegions(fastaSeq.sequence())
		})
		done()
	}
}
