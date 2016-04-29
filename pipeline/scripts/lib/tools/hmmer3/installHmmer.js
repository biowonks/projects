'use strict'

// Core includes
let path = require('path')

// Local includes
let config = require('../../../../config.js'),
	mutil = require(path.resolve(config.paths.lib, 'mutil'))

// Constants
let kAlias = 'hmmer3',
	kHmmer3Config = config.vendor.tools[kAlias]
		
module.exports = function() {
	let hmmer3SrcDir = path.basename(kHmmer3Config.ftpUrl, '.tar.gz'),
		hmmer3BinDir = path.resolve(config.paths.vendorTools, kAlias, kHmmer3Config.version),
		downloadResult = null,
		originalDirectory = process.cwd()

	process.chdir(config.paths.vendorTools)
	
	return mutil.download(kHmmer3Config.ftpUrl, config.paths.vendorTools)
	.then((result) => {
		downloadResult = result
		return mutil.shellCommand(`tar zxvf ${result.destFile}`)
	})
	.then(() => {
		process.chdir(hmmer3SrcDir)
		return mutil.shellCommands([
			`./configure --prefix ${hmmer3BinDir}`,
			'make',
			'make check',
			'make install'
		], true /* verbose */)
	})
	.then(() => {
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
