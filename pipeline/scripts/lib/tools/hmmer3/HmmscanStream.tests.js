'use strict'
// Core node libraries
let path = require('path')

// Local includes
let HmmscanStream = require('./HmmscanStream'),
	hmmDatabaseFile = path.resolve(__dirname, '../../../../..//db/pfam/29.0/Pfam-A.hmm'),
	fastaFile = path.resolve(__dirname, 'demo.faa')

describe('HmmscanStream', function() {
	// let hmmscanStream = new HmmscanStream(hmmDatabaseFile, fastaFile)
	// hmmscanStream.on('data', function(result) {
	// 	console.log(result);
	// })
})
