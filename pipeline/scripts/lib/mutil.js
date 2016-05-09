'use strict'

// Core node libraries
let child_process = require('child_process'),
	crypto = require('crypto'),
	domain = require('domain'),
	fs = require('fs'),
	path = require('path'),
	temp = require('temp'),
	zlib = require('zlib'),
	mv = require('mv')

// 3rd-party libraries
let Promise = require('bluebird'),
	mkdirp = require('mkdirp'),
	moment = require('moment')

// Local includes
let dbSetup = require('../../../db-setup'),
	dbModels = require('../../../models')

exports.initORM = function(config, logger) {
	let result = {
		sequelize: null,
		models: null
	};

	return dbSetup(config, logger)
		.then((sequelize) => {
			result.sequelize = sequelize
			return dbModels(sequelize, logger)
		})
		.then((models) => {
			result.models = models
			return result
		})
}

/**
 * Creates the directory ${directory} if it does not already exist. Note, the immediate
 * parent directory must already exist for this to succeed.
 *
 * @param {string} directory
 * @return {Promise}
 */
exports.mkdir = function(directory) {
	return new Promise((resolve, reject) => {
		fs.mkdir(directory, (error) => {
			if (error) {
				if (error.code === 'EEXIST')
					return resolve({
						created: false,
						directory: directory
				})

				return reject(error)
			}

			resolve({
				created: true,
				directory: directory
			})
		})
	})
}

/**
 * Runs ${command} on the shell and resolves with the stdout and stderr output.
 * 
 * @param {string} command
 * @param {boolean?} optVerbose if true log the command being executed; defaults to false
 * @return {Promise}
 */
exports.shellCommand = function(command, optVerbose) {
	return new Promise((resolve, reject) => {
		if (optVerbose)
			console.log(command)

		child_process.exec(command, function(err, stdout, stderr) {
			if (err)
				return reject(err)

			resolve({
				stdout: stdout,
				stderr: stderr
			})
		})
	})
}

/**
 * Serially executes each command in the ${commands} array.
 * 
 * @param {Array.<string>} commands
 * @param {boolean?} optVerbose if true log the command being executed; defaults to false
 * @return {Promise}
 */
exports.shellCommands = function(commands, optVerbose) {
	return Promise.each(commands, (command) => {
		return exports.shellCommand(command, optVerbose)
	})
}

/**
 * Uses wget to fetch files which is programmed to retry up to 20x by default. Thus,
 * no need to check / retry multiple times.
 * 
 * @param {string} url
 * @param {string?} optDestFile defaults to the base name of url in the current directory;
 *   if optDestFile is a directory, then the resulting file is that directory/
 *   url base name 
 * @return {Promise}
 */
exports.download = function(url, optDestFile) {
	if (!url)
		return Promise.reject(new Error('Missing url argument: url'))

	let destFile = null,
		tmpDestFile = null
	return determineDestFile_(url, optDestFile)
		.then((result) => {
			destFile = result
			tmpDestFile = destFile + '.tmp'
			
			return exports.shellCommand(`wget --quiet -O "${tmpDestFile}" ${url}`)
		})
		.catch((error) => {
			// Cleanup the temporary file created by wget on failure
			return exports.unlink(tmpDestFile)
				// Swallow any unlink errors (e.g. file didn't actually exist, etc - because
				// we don't care about such things here)
				.catch(() => {})
				// But at the end of all this, rethrow the original shell command error
				.finally(() => {
					throw error 
				})
		})
		.then(() => {
			return exports.rename(tmpDestFile, destFile)
		})
		.then(() => {
			return {
				url: url,
				destFile: destFile
			}
		})
}

/**
 * Private helper function to determine a suitable destFile name from ${url} and the optional
 * ${optDestFile}. There are 3 possible scenarios:
 * 1) ${optDestFile} is not defined: return the basename of the url
 * 2) ${optDestFile} is a directory, return the directory name + the ${url} basename
 * 3) ${optDestFile} is an actual path with a file name (that may or may not exist): return
 *    the path
 *
 * @param {string} url
 * @param {string?} optDestFile
 * @return {string} absolute path to the computed destFile
 */
function determineDestFile_(url, optDestFile) {
	if (!optDestFile)
		return Promise.resolve(path.basename(url))
	
	return exports.stat(optDestFile)
		.then((stats) => {
			return stats.isDirectory() ? path.resolve(optDestFile, path.basename(url)) : optDestFile
		})
		.catch((error) => {
			let fileDoesntExist = error.code === 'ENOENT'
			if (fileDoesntExist)
				return path.resolve(optDestFile)

			throw error
		})
}

exports.durationFromInterval = function(interval) {
	let matches = /^(\d+)\s+(\w+)/.exec(interval)
	if (!matches)
		return moment.duration(interval)

	return moment.duration(parseInt(matches[1]), matches[2])
}

/**
 * @param {string} gzFile
 * @param {string?} optDestFile
 * @return {Promise}
 */
exports.gunzip = function(gzFile, optDestFile) {
	return new Promise((resolve, reject) => {
		let domain = domain.create()
		domain.on('error', (error) => {
			reject(error)
		})
		domain.run(() => {
			let gzFileStream = fs.createReadStream(gzFile),
				gunzipStream = zlib.createGunzip(),
				destFile = optDestFile ? optDestFile : exports.basename(gzFile),
				destFileStream = fs.createWriteStream(destFile)

			gzFileStream
				.pipe(gunzipStream)
				.pipe(destFileStream)
				.on('close', () => {
					resolve({
						gzFile: gzFile,
						destFile: destFile
					})
				})
		})
	})
}

exports.readFile = function(file) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'utf8', (err, data) => {
			if (err)
				return reject(err)

			resolve(data)
		})
	})
}

exports.stat = function(queryPath) {
	return new Promise((resolve, reject) => {
		fs.stat(queryPath, function(error, stats) {
			if (error)
				return reject(error);

			resolve(stats)
		})
	})
}

/**
 * Returns true if ${queryPath} both exists and is younger than ${intervalMs}
 */
exports.pathIsYoungerThan = function(queryPath, intervalMs) {
	return exports.stat(queryPath)
		.then(function(fsStats) {
			let birthMoment = moment(fsStats.birthtime)

			return moment().diff(birthMoment) < intervalMs
		})
		.catch(function(error) {
			return false
		})
}

exports.basename = function(fileName) {
	return path.basename(fileName, path.extname(fileName))
}

exports.directoryExists = function(directory) {
	return new Promise((resolve) => {
		fs.stat(directory, (error, stats) => {
			if (error)
				return resolve(false)

		resolve(stats.isDirectory())
		})
	})
};

exports.fileExists = function(file, optNotZero) {
	return new Promise((resolve) => {
		fs.stat(file, (error, stats) => {
			if (error)
				return resolve(false)

			let hasBytes = stats.size > 0
			resolve(optNotZero ? hasBytes : true)
		})
	})
}

exports.fileNotEmpty = function(file) {
	return exports.fileExists(file, true)
}

/**
 * Renames ${srcFile} to ${destFile}. It is the caller's responsibility to ensure that
 * the parent directory for ${destFile} already exists.
 * 
 * @param {string} srcFile
 * @param {string} destFile}
 @ returns {Promise}
 */
exports.rename = function(srcFile, destFile) {
	return new Promise((resolve, reject) => {
		mv(srcFile, destFile, function(error) {
			if (error)
				return reject(error)

			resolve({
				srcFile: srcFile,
				destFile: destFile
			})
		})
	})
}

/**
 * @param {string} directory
 * @returns {Promise}
 */
exports.mkdirp = function(directory) {
	return exports.directoryExists(directory)
		.then((directoryExists) => {
			if (directoryExists)
				return {created: false, directory: directory}

			return new Promise((resolve, reject) => {
				mkdirp(directory, (error) => {
					if (error)
						return reject(error)

					resolve({created: true, directory: directory})
				})
			})
		})
}

exports.unlink = function(file) {
	return new Promise((resolve, reject) => {
		fs.unlink(file, (error) => {
			if (!error)
				return resolve()

			if (error !== 'ENOENT')
				return reject(error)
		})
	})
}

exports.checkFileMD5 = function(file, md5) {
	return new Promise((resolve, reject) => {
		let stream = fs.createReadStream(file),
			md5hash = crypto.createHash('md5')

		md5hash.setEncoding('hex')
		stream
		.on('error', reject)
		.on('end', () => {
			md5hash.end()
			resolve(md5hash.read().toLowerCase() === md5.toLowerCase())
		})

		stream.pipe(md5hash)
	})
}
