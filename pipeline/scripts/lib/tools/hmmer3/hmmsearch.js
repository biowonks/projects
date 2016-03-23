'use strict'

// Usage
// node hmmscan.js fasta


let fs = require('fs'),
	assert = require('assert'),
	byline = require('byline'),
	path = require('path'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec

let fasta = process.argv[2],
	hmmsearch = path.resolve(__dirname, 'bin/hmmsearch'),
	hmmsearch_parser = path.resolve(__dirname, 'hmmsearch_parser.js'),
	hmm_db = path.resolve(__dirname, '../../../../../db/pfam/29.0/Pfam-A.hmm'),
	output_tbl = path.resolve(__dirname, 'demo.out.tbl'),
	outputJson = path.resolve(__dirname, 'demo.out.json'),
	hmmsearchCommand = spawn(hmmsearch, ['--cpu' , '0', '--cut_ga', '--domtblout', output_tbl, hmm_db, fasta]),
	hmmsearch_parserCommand = 'node ' + hmmsearch_parser + ' ' +  fasta + ' ' + output_tbl + ' ' + outputJson

	
hmmsearchCommand.stdout.on('data', (data) => {})

hmmsearchCommand.stderr.on('data', (data) => {
	console.log(`stderr: ${data}`)
})

hmmsearchCommand.on('close', (code) => {
	console.log(`HMMSEARCH is completed: child process exited with code ${code}`)
	exec(hmmsearch_parserCommand, 
		function(error, stdout, stderr) {
			console.log('hmmsearch_parser.js stdout: ', stdout)
			console.log('hmmsearch_parser.js stderr: ', stderr)
		}
	)
})




