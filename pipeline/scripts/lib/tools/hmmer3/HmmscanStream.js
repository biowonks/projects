'use strict'

// Core node libraries
let	child_process = require('child_process'), // eslint-disable-line camelcase
	path = require('path'),
	Transform = require('stream').Transform

// Local includes
let config = require('../../../../config'),
	HmmscanResultReaderStream = require('./HmmscanResultReaderStream')

// Constants
let kHmmscanPath = path.resolve(config.vendor.hmmer3.binPath, 'hmmscan')

/**
 * HmmscanStream executes HMMER3 for a given HMM database and FASTA file. The results
 * are piped to this instance, parsed, and streamed to a downstream source.
 */
module.exports =
class HmmscanStream extends Transform {
	/**
	 * @param {string} hmmDatabaseFile path to hmm database to search
	 * @param {string} fastaFile path to source fasta file to run hmmscan against
	 * @param {number?} optZ number of comparisons to base E-value calculation from
	 */
	constructor(hmmDatabaseFile, fastaFile, optZ) {
		super({objectMode: true})

		let hmmscanArgs = ['--noali', '--cut_ga']
		if (optZ) {
			hmmscanArgs.push('-Z')
			hmmscanArgs.push(optZ)
		}
		hmmscanArgs.push(hmmDatabaseFile)
		hmmscanArgs.push(fastaFile)

		let hmmscanResultReaderStream = new HmmscanResultReaderStream(),
			hmmscanProcess = child_process.spawn(kHmmscanPath, hmmscanArgs)

		hmmscanResultReaderStream.pipe(this)
		hmmscanProcess.stdout.pipe(hmmscanResultReaderStream)
	}

	_transform(result, encoding, done) {
		this.push(result)
		done()
	}
}
