'use strict'

/*
Example usage:
hmmscan --noali --cut_ga ~/mist3-api/db/pfam/29.0/Pfam-A.hmm ~/mist3-api/pipeline/scripts/lib/tools/hmmer3/demo.faa | node ~/mist3-api/pipeline/scripts/lib/tools/hmmer3/hmmscan_caller.js
*/

let fs = require('fs'),
	path = require('path'),
	hmmscanReaderStream = require(path.resolve(__dirname, 'HmmscanReaderStream')),
	HmmscanResult = require(path.resolve(__dirname, 'HmmscanResult'))

let inStream = process.stdin,
	hmmscanStream = new hmmscanReaderStream()

inStream.pipe(hmmscanStream)
	.on('data', (result) => {
		let HmmscanResultObject = new HmmscanResult(result)
		console.log(HmmscanResultObject)
	})
	.on('finish', () => {})