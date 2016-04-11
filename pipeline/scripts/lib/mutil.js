'use strict'

// Core node libraries
let child_process = require('child_process'),
	crypto = require('crypto'),
	domain = require('domain'),
	fs = require('fs'),
	path = require('path'),
	temp = require('temp'),
	zlib = require('zlib')

// 3rd-party libraries
let Promise = require('bluebird'),
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
 * Uses wget to fetch files which is programmed to retry up to 20x by default. Thus,
 * no need to check / retry multiple times.
 */
exports.download = function(url, optDestFile) {
	return new Promise(function(resolve, reject) {
		if (!url)
			return reject(new Error('Missing url argument: url'))

		let destFile = optDestFile ? optDestFile : exports.basename(url),
			tmpDestFile = destFile + '.tmp'
		let command = 'wget --quiet -O "' + tmpDestFile + '" ' + url

		child_process.exec(command, function(error, stdout) {
			if (error)
				return reject(error)

			fs.rename(tmpDestFile, destFile, function(error) {
				if (error)
					return reject(error)

				resolve({
					url: url,
					destFile: destFile
				})
			})
		})
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
		let gunzipDomain = domain.create()
		gunzipDomain.on('error', (error) => {
			reject(error)
		})
		gunzipDomain.run(() => {
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

exports.pathStat = function(queryPath) {
	return new Promise(function(resolve, reject) {
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
	return exports.pathStat(queryPath)
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

// Resolves true if directory needed to be created
exports.mkdir = function(directory) {
	return new Promise((resolve, reject) => {
		fs.mkdir(directory, (error) => {
			if (error) {
				if (error.code === 'EEXIST')
					return resolve({created: false, directory: directory})

				return reject(error)
			}

			resolve({created: true, directory: directory})
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