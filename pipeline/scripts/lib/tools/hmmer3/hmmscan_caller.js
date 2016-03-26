'use strict'

/*
hmmscan --noali --cut_ga ~/mist3-api/db/pfam/29.0/Pfam-A.hmm demo.faa | node hmmscan_caller.js
*/

let fs = require('fs'),
	path = require('path'),
	//hmmscanReaderStream = require('./HmmscanReaderStream'),
	hmmscanReaderStream = require(path.resolve(__dirname, 'HmmscanReaderStream')),
	//HmmscanResult = require('./HmmscanResult'),
	HmmscanResult = require(path.resolve(__dirname, 'HmmscanResult')),
	//inStream = fs.createReadStream(process.argv[2])
	inStream = process.stdin

let hmmscanStream = new hmmscanReaderStream(),
	results = []


inStream.pipe(hmmscanStream)
	.on('data', (result) => {

		let HmmscanResultObject = new HmmscanResult(result)

		console.log(HmmscanResultObject)
	})
	.on('finish', () => {

		//console.log(results[0])
	})
