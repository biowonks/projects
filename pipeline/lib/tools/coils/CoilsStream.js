'use strict'

// Core node libraries
let child_process = require('child_process'), // eslint-disable-line camelcase
	path = require('path'),
	Transform = require('stream').Transform

// Local includes
let config = require('../../../../config'),
	FastaReaderStream = require('../../streams/FastaReaderStream'),
	seqUtil = require('../../bio/seq-util')

// Constants
const kCoilsToolDir = config.pipeline.vendor.coils.basePath,
	kCoilsToolFile = path.resolve(kCoilsToolDir, 'ncoils')

module.exports =
class CoilsStream extends Transform {
	constructor() {
		super({objectMode: true})

		this.coilsTool_ = child_process.spawn(kCoilsToolFile, ['-f'], {
			env: {
				COILSDIR: kCoilsToolDir
			}
		})
		this.coilsTool_.on('error', (error) => {
			this.emit('error', error)
		})

		this.fastaReaderStream_ = new FastaReaderStream(true /* skip empty sequences */)
		this.fastaReaderStream_.pipe(this)

		this.on('pipe', (src) => {
			src.unpipe(this)

			src.pipe(this.coilsTool_.stdin)
			this.coilsTool_.stdout.pipe(this.fastaReaderStream_)
		})
	}

	_transform(fastaSeq, encoding, done) {
		this.push({
			header: fastaSeq.header(),
			coils: seqUtil.parseMaskedRegions(fastaSeq.sequence())
		})
		done()
	}
}
