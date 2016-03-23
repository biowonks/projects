'use strict'

let fs = require('fs')

var infile = "/home/amit/test.fa"
var outfile = "/home/amit/test_out"

var childProcess = require('child_process'),
	phobius
	var command = "/home/amit/phobius/phobius.pl -short "+infile+">"+outfile
	phobius = childProcess.exec(command, function (error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			console.log('Error code: '+error.code);
		}
		//console.log('Child Process STDOUT: '+stdout)
		//console.log('Child Process STDERR: '+stderr)
	 })
