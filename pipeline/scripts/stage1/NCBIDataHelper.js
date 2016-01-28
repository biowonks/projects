'use strict'

// Core node libraries
let fs = require('fs')

// 3rd-party libraries
let Promise = require('bluebird'),
	byline = require('byline')

// Local includes
let mutil = require('../lib/mutil')

class NCBIDataHelper {
	constructor(fileNameMapper, logger) {
		this.fileNameMapper_ = fileNameMapper
		this.logger_ = logger.child({phase: 'download'})

		// {fileName: md5}
		this.checksums_ = null
	}

	downloadAll() {
		this.logger_.info('Initiating file download process from NCBI')
		return this.getChecksums_()
		.then(() => {
			return Promise.each(this.fileNameMapper_.sourceTypes(), this.download_.bind(this))
		})
	}

	download_(sourceType) {
		if (sourceType === 'checksums')
			return

		let destFile = this.fileNameMapper_.pathFor(sourceType)
		return mutil.fileNotEmpty(destFile)
		.then((exists) => {
			if (!exists)
				return this.downloadAndVerify_(sourceType)

			return this.verify_(sourceType)
			.then((isComplete) => {
				if (isComplete)
					return

				// File exists but is not complete
				this.logger_.info({sourceType: sourceType, file: destFile}, 'File exists, but is not complete')
				return mutil.unlink(destFile)
				.then(() => {
					this.logger_.info({file: destFile}, 'Removed file')
					return this.downloadAndVerify_(sourceType)
				})
			})
		})
	}

	downloadAndVerify_(sourceType) {
		console.assert(!!this.checksums_, 'Expected checksums to be defined')

		let url = this.fileNameMapper_.urlFor(sourceType),
			destFile = this.fileNameMapper_.pathFor(sourceType)

		this.logger_.info({sourceType: sourceType, url: url, file: destFile}, 'Downloading ' + sourceType)
		return mutil.download(url, destFile)
		.then(() => {
			return this.verify_(sourceType)
		})
		.then((isComplete) => {
			if (!isComplete) {
				this.logger_.error({sourceType: sourceType, url: url, file: destFile}, 'File contents are not valid')
				throw new Error('Incomplete data for ' + sourceType + ' from: ' + url)
			}
		})
	}

	verify_(sourceType) {
		console.assert(!!this.checksums_, 'Expected checksums to be defined')

		let destFile = this.fileNameMapper_.pathFor(sourceType),
			fileName = this.fileNameMapper_.fileNameFor(sourceType),
			checksum = this.checksums_[fileName]

		if (checksum) {
			this.logger_.info({sourceType: sourceType}, 'Verifying file contents')
			return mutil.checkFileMD5(destFile, checksum)
		}

		// To my knowledge, only the assembly report lacks a checksum
		// For now, assuming that wget would report error if only part of
		// the file is retrieved...
		this.logger_.info({file: destFile}, 'No checksum found, assuming file contents are valid')
		return Promise.resolve(true)
	}

	getChecksums_() {
		if (this.checksums_)
			return Promise.resolve(this.checksums_)

		let url = this.fileNameMapper_.urlFor('checksums'),
			destFile = this.fileNameMapper_.pathFor('checksums')

		return mutil.fileNotEmpty(destFile)
		.then((exists) => {
			if (!exists) {
				this.logger_.info({url: url}, 'Downloading checksums')
				return mutil.download(url, destFile)
			}
		})
		.then(() => {
			return this.readChecksumsFromFile_(destFile)
		})
		.catch((error) => {
			return mutil.unlink(destFile)
			.finally(() => {
				// Regardless of the success or failure of removing this file
				// re-throw the parsing error
				throw error
			})
		})
		.then((checksums) => {
			let nChecksums = Object.keys(checksums).length
			this.logger_.info(`Successfully parsed ${nChecksums} checksums`)
			this.checksums_ = checksums
			return checksums
		})
	}

	readChecksumsFromFile_(file) {
		return new Promise((resolve, reject) => {
			let stream = byline.createStream(fs.createReadStream(file)),
				checksums = {},
				invalidChecksumLine = null

			stream
			.on('error', reject)
			.on('data', (line) => {
				let checksum = this.parseChecksumLine_(line)
				if (checksum) {
					let md5 = checksum[0],
						fileName = checksum[1]
					checksums[fileName] = md5
				}
				else if (!invalidChecksumLine && /\S/.test(line)) {
					invalidChecksumLine = line
				}
			})
			.on('end', () => {
				if (!invalidChecksumLine) {
					resolve(checksums)
				}
				else {
					this.logger_.error({line: invalidChecksumLine}, 'Invalid checksum line')
					reject(new Error('Invalid checksum line: ' + invalidChecksumLine))
				}
			})
		})
	}

	parseChecksumLine_(line) {
		let matches = /^([a-f0-9]{32})\s+(?:\.\/)?(\S+)/i.exec(line)
		if (!matches)
			return

		let md5 = matches[1],
			fileName = matches[2]
		return [md5, fileName]
	}
}

module.exports = NCBIDataHelper
