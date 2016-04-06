'use strict'

// Core node libraries
let child_process = require('child_process'),
	path = require('path'),
	Transform = require('stream').Transform

// Local includes
let HmmscanResultReaderStream = require('./HmmscanResultReaderStream')

// Constants
let kHmmscanToolFile = path.resolve(__dirname, 'bin/hmmscan')

/**
 * HmmscanStream executes HMMER3 for a given HMM database and FASTA file. The results
 * are piped to this instance, parsed, and streamed to a downstream source.
 */
module.exports =
class HmmscanStream extends Transform {
	/**
	 * @constructor
	 * @param {string} hmmDatabaseFile path to hmm database to search
	 * @param {string} fastaFile path to source fasta file to run hmmscan against
	 */
	constructor(hmmDatabaseFile, fastaFile) {
		super({objectMode: true})

		this.hmmscanResultReaderStream_ = new HmmscanResultReaderStream()
		this.hmmscanTool_ = child_process.spawn(kHmmscanToolFile, ['--noali', '--cut_ga', hmmDatabaseFile, fastaFile])
		this.hmmscanTool_.stdout.pipe(this.hmmscanResultReaderStream_)
		this.hmmscanResultReaderStream_.pipe(this)
	}

	_transform(parsedResult, encoding, done) {
		this.push(parsedResult)
		done()
	}
}
