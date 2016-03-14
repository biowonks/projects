'use strict'

// Usage
// node hmmscan.js fasta


let fs = require('fs'),
	assert = require('assert'),
	byline = require('byline'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec

let root = __dirname.split('mist3-api')[0] + "mist3-api",
	hmmsearch = root + "/pipeline/scripts/lib/tools/hmmer3/bin/hmmsearch",
	hmmsearch_parser = root + "/pipeline/scripts/lib/tools/hmmer3/hmmsearch_parser.js",
	fasta = process.argv[2],
	hmm_db = root + "/db/pfam/29.0/Pfam-A.hmm",
	output_tbl = root + "/pipeline/scripts/lib/tools/hmmer3/demo.out.tbl",
	outputJson = root + "/pipeline/scripts/lib/tools/hmmer3/demo.out.json",
	hmmsearchCommand = spawn(hmmsearch, ['--cpu' , '0', '--cut_ga', '--domtblout', output_tbl, hmm_db, fasta]),
	hmmsearch_parserCommand = "node " + hmmsearch_parser + " " +  fasta + " " + output_tbl + " " + outputJson

	
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




