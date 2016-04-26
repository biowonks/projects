'use strict'

let fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	exec = require('child_process').exec,
	config = require(path.resolve(__dirname, '../../../../config.js')),
	mutil = require(path.resolve(config.paths.lib, 'mutil')),
	Promise = require('bluebird')
	
let paths = config.paths,
	hmmerFtp = config.hmmer.ftp,
	version = '3.1',
	hmmerFtpAddress = hmmerFtp[version],
	localHmmer = path.resolve(paths.vendorTools, config.hmmer.local[version]),
	localHmmerGz = localHmmer + '.tar.gz',
	defaultHmmFileGz = path.resolve(paths.vendorTools, hmmerFtpAddress.split('\/').slice(-1)[0]),
	defaultHmmFile = path.resolve(paths.vendorTools, hmmerFtpAddress.split('\/').slice(-1)[0]).replace('.tar.gz', '')


module.exports = function() {
	return mutil.download(hmmerFtpAddress, localHmmerGz)
	.then(() => {return mutil.shellCommand('tar xzvf ' + localHmmerGz + ' -C ' + paths.vendorTools)
	.then(() => {return mutil.shellCommand('rm ' + localHmmerGz)})
	})
	.then(() => {return mutil.shellCommand('mv ' + defaultHmmFile + ' ' + localHmmer)})
	.then(() => {return mutil.chdir(localHmmer)})
	.then(() => {return mutil.shellCommand('./configure' + ' --prefix ' + localHmmer)})
	.then(() => {return mutil.shellCommand('make')})
	.then(() => {return mutil.shellCommand('make check')})
	.then(() => {return mutil.shellCommand('make install')})
	.catch((error) => {
		console.log(error)
	})
}