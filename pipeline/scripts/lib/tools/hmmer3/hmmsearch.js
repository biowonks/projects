'use strict'

// Usage
// node hmmscan.js fasta



let root = __dirname.split('mist3-api')[0] + "mist3-api",
	hmm_scan = root + "/pipeline/scripts/lib/tools/hmmer3/bin/hmmsearch",
	fasta = process.argv[2],
	hmm_db = root + "/db/pfam/29.0/Pfam-A.hmm",
	output = root + "/pipeline/scripts/lib/tools/hmmer3/out.tbl"

let fs = require('fs'),
	assert = require('assert'),
	byline = require('byline'),
	spawn = require('child_process').spawn,
	command = spawn(hmm_scan, ['--cpu' , '0', '--cut_ga', '--domtblout', output, hmm_db, fasta])


command.stdout.on('data', (data) => {
})

command.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`)
})

command.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})



