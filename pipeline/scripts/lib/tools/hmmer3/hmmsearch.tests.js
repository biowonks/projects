'use strict'

let fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec	

describe.skip('HMMsearch', function() {
	it('performing HMMsearch', function(done) {
		this.timeout(500000)
		let inputFile = path.resolve(__dirname, 'demo.faa'),
			hmmsearch = path.resolve(__dirname, 'hmmsearch.js')

		exec('node ' + hmmsearch + ' ' + inputFile)
		done()
	})
})
