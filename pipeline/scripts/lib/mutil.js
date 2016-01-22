'use strict'

// Core node libraries
let child_process = require('child_process'),
	fs = require('fs'),
	path = require('path'),
	temp = require('temp')

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

exports.download = function(url, optDestFile) {
	return new Promise(function(resolve, reject) {
		if (!url)
			return reject(new Error('Missing url argument: url'))

		let destFile = optDestFile ? optDestFile : exports.basename(url),
			tmpDestFile = destFile + '.tmp'
		let command = 'wget -O "' + tmpDestFile + '" ' + url

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

exports.basename = function(filename) {
	return path.basename(filename, path.extname(filename))
}
