'use strict'

// Core node libraries
let child_process = require('child_process'), // eslint-disable-line camelcase
	crypto = require('crypto'),
	domain = require('domain'),
	fs = require('fs'),
	path = require('path'),
	zlib = require('zlib'),
	xml2js = require('xml2js'),
	mv = require('mv')

// 3rd-party libraries
let Promise = require('bluebird'),
	mkdirp = require('mkdirp'),
	moment = require('moment')

/**
 * Creates the directory ${directory} if it does not already exist. Note, the immediate
 * parent directory must already exist for this to succeed.
 *
 * @param {string} directory name of directory
 * @returns {Promise} promise
 */
exports.mkdir = function(directory) {
	return new Promise((resolve, reject) => {
		fs.mkdir(directory, (error) => {
			if (error) {
				if (error.code === 'EEXIST') {
					resolve({
						created: false,
						directory
					})
					return
				}

				reject(error)
				return
			}

			resolve({
				created: true,
				directory
			})
		})
	})
}

/**
 * Runs ${command} on the shell and resolves with the stdout and stderr output.
 *
 * @param {string} command actual command to be run on the shell
 * @param {boolean?} optVerbose if true log the command being executed; defaults to false
 * @returns {Promise} promise
 */
exports.shellCommand = function(command, optVerbose) {
	return new Promise((resolve, reject) => {
		if (optVerbose)
			console.info(command) // eslint-disable-line no-console

		child_process.exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error)
			}
			else {
				resolve({
					stdout,
					stderr
				})
			}
		})
	})
}

/**
 * Serially executes each command in the ${commands} array.
 *
 * @param {Array.<string>} commands array of actual commands to serially run on the shell
 * @param {boolean?} optVerbose if true log the command being executed; defaults to false
 * @returns {Promise} promise
 */
exports.shellCommands = function(commands, optVerbose) {
	return Promise.each(commands, (command) => exports.shellCommand(command, optVerbose))
}

/**
 * Uses wget to fetch files which is programmed to retry up to 20x by default. Thus,
 * no need to check / retry multiple times.
 *
 * @param {string} url URL
 * @param {string?} optDestFile defaults to the base name of url in the current directory;
 *   if optDestFile is a directory, then the resulting file is that directory/
 *   url base name
 * @returns {Promise} promise
 */
exports.download = function(url, optDestFile) {
	if (!url)
		return Promise.reject(new Error('Missing url argument: url'))

	let destFile = null,
		tmpDestFile = null
	return determineDestFile_(url, optDestFile)
		.then((result) => {
			destFile = result
			tmpDestFile = `${destFile}.tmp`

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
		.then(() => exports.rename(tmpDestFile, destFile))
		.then(() => {
			return {url, destFile}
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
 * @param {string} url URL
 * @param {string?} optDestFile see above for details
 * @returns {string} absolute path to the computed destFile
 */
function determineDestFile_(url, optDestFile) {
	if (!optDestFile)
		return Promise.resolve(path.basename(url))

	return exports.stat(optDestFile)
		.then((stats) => {
			return stats.isDirectory() ? path.resolve(optDestFile, path.basename(url)) : path.resolve(optDestFile)
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
 * @param {string} gzFile path to gzipped file
 * @param {string?} optDestFile optional file name
 * @returns {Promise} promise
 */
exports.gunzip = function(gzFile, optDestFile) {
	return new Promise((resolve, reject) => {
		let d = domain.create()
		d.on('error', (error) => {
			reject(error)
		})
		d.run(() => {
			let gzFileStream = fs.createReadStream(gzFile),
				gunzipStream = zlib.createGunzip(),
				destFile = optDestFile ? optDestFile : exports.basename(gzFile),
				destFileStream = fs.createWriteStream(destFile)

			gzFileStream
				.pipe(gunzipStream)
				.pipe(destFileStream)
				.on('close', () => {
					resolve({gzFile, destFile})
				})
		})
	})
}

exports.readFile = function(file) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'utf8', (error, data) => {
			if (error)
				reject(error)
			else
				resolve(data)
		})
	})
}

exports.xmlToJs = function(xml) {
	return new Promise((resolve, reject) => {
		xml2js.parseString(xml, {trim: true}, (error, result) => {
			if (error)
				reject(error)
			else
				resolve(result)
		})
	})
}

exports.stat = function(queryPath) {
	return new Promise((resolve, reject) => {
		fs.stat(queryPath, (error, stats) => {
			if (error)
				reject(error)
			else
				resolve(stats)
		})
	})
}

/**
 * @param {string} queryPath path to test
 * @param {number} ms number of milliseconds
 * @returns {Promise} resolves to true if ${queryPath} both exists and is younger than ${ms};
 *   false otherwise
 */
exports.pathIsYoungerThan = function(queryPath, ms) {
	return exports.stat(queryPath)
		.then((fsStats) => {
			let birthMoment = moment(fsStats.birthtime)

			return moment().diff(birthMoment) < ms
		})
		.catch(() => false)
}

exports.basename = function(fileName) {
	return path.basename(fileName, path.extname(fileName))
}

exports.directoryExists = function(directory) {
	return new Promise((resolve) => {
		fs.stat(directory, (error, stats) => {
			if (error)
				resolve(false)
			else
				resolve(stats.isDirectory())
		})
	})
}

exports.fileExists = function(file, optNotZero) {
	return new Promise((resolve) => {
		fs.stat(file, (error, stats) => {
			if (error) {
				resolve(false)
				return
			}

			resolve(optNotZero ? stats.size > 0 : true)
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
 * @param {string} srcFile path to source file
 * @param {string} destFile path to dest file
 * @returns {Promise} promise
 */
exports.rename = function(srcFile, destFile) {
	return new Promise((resolve, reject) => {
		mv(srcFile, destFile, (error) => {
			if (error)
				reject(error)
			else
				resolve({srcFile, destFile})
		})
	})
}

/**
 * @param {string} directory target directory
 * @returns {Promise} promise
 */
exports.mkdirp = function(directory) {
	return exports.directoryExists(directory)
		.then((directoryExists) => {
			if (directoryExists)
				return {created: false, directory}

			return new Promise((resolve, reject) => {
				mkdirp(directory, (error) => {
					if (error)
						reject(error)
					else
						resolve({created: true, directory})
				})
			})
		})
}

exports.unlink = function(file) {
	return new Promise((resolve, reject) => {
		fs.unlink(file, (error) => {
			if (!error || error.code === 'ENOENT')
				resolve()
			else
				reject(error)
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

exports.createDeferred = function() {
	let resolve = null,
		reject = null,
		promise = new Promise((...args) => {
			resolve = args[0]
			reject = args[1]
		})

	return {resolve, reject, promise}
}

exports.pseudoIdSequence = function *() {
	let index = 1
	while (true) // eslint-disable-line no-constant-condition
		yield index++
}
