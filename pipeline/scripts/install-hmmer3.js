'use strict'

// Core includes
let path = require('path')

// 3rd party includes
let Promise = require('bluebird'),
	gutil = require('gulp-util')

// Local includes
let config = require('../config.js'),
	mutil = require(path.resolve(config.paths.lib, 'mutil'))
	
// Constants
let kAlias = 'hmmer3',
	kBinTools = [
		'hmmscan',
		'hmmpress'
	]

module.exports = function() {
	return alreadyInstalled()
		.then((isAlreadyInstalled) => {
			if (!isAlreadyInstalled)
				return install()
			else
				gutil.log(kAlias, 'Already installed')
		})
}

function alreadyInstalled() {
	return Promise.each(kBinTools, (binTool) => {
		let binToolPath = path.resolve(config.vendor.tools[kAlias].binPath, binTool)
		return mutil.fileExists(binToolPath, true /* not zero */)
			.then((binToolExists) => {
				if (!binToolExists)
					return Promise.reject() 
			})
	})
	.then(() => {
		return true
	})
	.catch(() => {
		return false
	})
}

function install() {
	let hmmer3Config = config.vendor.tools[kAlias],
		hmmer3SrcDir = path.basename(hmmer3Config.ftpUrl, '.tar.gz'),
		// Note: hmmer3DestDir !== config.vendor.tools[kAlias].binPath
		hmmer3DestDir = path.resolve(config.paths.vendorTools, kAlias, hmmer3Config.version),
		downloadResult = null,
		originalDirectory = process.cwd()

	process.chdir(config.paths.vendorTools)
	
	gutil.log('Downloading', hmmer3Config.ftpUrl)
	return mutil.download(hmmer3Config.ftpUrl, config.paths.vendorTools)
	.then((result) => {
		downloadResult = result
		gutil.log('Decompressing tarball')
		return mutil.shellCommand(`tar zxvf ${result.destFile}`)
	})
	.then(() => {
		gutil.log('Configuring and compiling')
		process.chdir(hmmer3SrcDir)
		return mutil.shellCommands([
			`./configure --prefix ${hmmer3DestDir}`,
			'make',
			'make check',
			'make install'
		], true /* verbose */)
	})
	.then(() => {
		gutil.log('Cleaning up')
		process.chdir(config.paths.vendorTools)
		return mutil.unlink(downloadResult.destFile)
	})
	.then(() => {
		return mutil.shellCommand(`rm -rf ${hmmer3SrcDir}`, true /* verbose */)
	})
	.catch((error) => {
		console.error(error)
		throw error
	})
	.finally(() => {
		process.chdir(originalDirectory)
	})
}