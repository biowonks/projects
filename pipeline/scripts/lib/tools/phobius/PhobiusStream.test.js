'use strict'

let fs = require('fs'),
	path = require('path')

let PhobiusStream = require('./PhobiusStream')

let inFile = path.resolve(__dirname, 'test.fa'),
	inStream = fs.createReadStream(inFile),
	phobiusStream = new PhobiusStream(),
	results = []

	inStream.pipe(phobiusStream)
	.on('data',(result) => {results.push(result)
	})
	
	

