'use strict'

// Core
const assert = require('assert'),
	fs = require('fs')

// Vendor
const Promise = require('bluebird'),
	byline = require('byline')

// Local
const mutil = require('../../../lib/mutil')

module.exports =
class NCBIDataHelper {
	constructor(fileMapper, logger) {
		this.fileMapper_ = fileMapper
		this.logger_ = logger

		// {fileName: md5}
		this.checksums_ = null
	}

	isDownloaded(sourceType) {
		return this.ensureChecksumsLoaded_()
		.then(() => {
			if (sourceType === 'checksums')
				return true

			return this.verify_(sourceType)
		})
	}

	download(sourceType) {
		if (sourceType === 'checksums')
			return this.ensureChecksumsLoaded_()

		let destFile = this.fileMapper_.pathFor(sourceType)
		return mutil.fileNotEmpty(destFile)
		.then((notEmpty) => {
			if (!notEmpty)
				return this.downloadAndVerify_(sourceType)

			return this.verify_(sourceType)
			.then((isComplete) => {
				if (isComplete)
					return null

				// File exists but is not complete
				this.logger_.info({sourceType, file: destFile}, 'File exists, but is not complete')
				return mutil.unlink(destFile)
				.then(() => {
					this.logger_.info({file: destFile}, 'Removed file')
					return this.downloadAndVerify_(sourceType)
				})
			})
		})
	}

	downloadAndVerify_(sourceType) {
		assert(!!this.checksums_, 'Expected checksums to be defined')

		let url = this.fileMapper_.ncbiUrlFor(sourceType),
			destFile = this.fileMapper_.pathFor(sourceType)

		this.logger_.info({sourceType, url, file: destFile}, `Downloading ${sourceType}`)
		return mutil.download(url, destFile)
		.then(() => this.verify_(sourceType))
		.then((isComplete) => {
			if (!isComplete) {
				this.logger_.error({sourceType, url, file: destFile}, 'Downloaded incomplete data file. Contents are not valid')
				throw new Error(`Incomplete data for ${sourceType} from: ${url}`)
			}
		})
	}

	verify_(sourceType) {
		assert(!!this.checksums_, 'Expected checksums to be defined')

		let destFile = this.fileMapper_.pathFor(sourceType)
		return mutil.fileExists(destFile)
		.then((fileExists) => {
			if (!fileExists)
				return false

			let fileName = this.fileMapper_.fileNameFor(sourceType),
				checksum = this.checksums_[fileName]
			if (checksum) {
				this.logger_.info({fileName}, `Verifying ${sourceType} file contents`)
				return mutil.checkFileMD5(destFile, checksum)
			}

			// To my knowledge, only the assembly report lacks a checksum
			// For now, assuming that wget would report error if only part of
			// the file is retrieved...
			this.logger_.info({fileName}, `No checksum found, assuming ${sourceType} file contents are valid`)
			return true
		})
	}

	ensureChecksumsLoaded_() {
		// Case 1: checksums already loaded into memory
		if (this.checksums_)
			return Promise.resolve(this.checksums_)

		// Case 2: checksums exist on file system but are not yet in memory
		return this.loadChecksums_()
		.catch(() => {
			// Case 3: they may or may not exist, but it was not possible to load them into
			// memory. Re-download
			return this.downloadChecksums_()
		})
	}

	loadChecksums_() {
		let checksumsFile = this.fileMapper_.pathFor('checksums')
		return this.readChecksumsFromFile_(checksumsFile)
		.catch((error) => {
			return mutil.unlink(checksumsFile)
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

	downloadChecksums_() {
		let url = this.fileMapper_.ncbiUrlFor('checksums'),
			destFile = this.fileMapper_.pathFor('checksums')

		this.logger_.info({url, destFile}, 'Downloading checksums')
		return mutil.download(url, destFile)
		.then(this.loadChecksums_.bind(this))
	}

	readChecksumsFromFile_(file) {
		return new Promise((resolve, reject) => {
			let readStream = fs.createReadStream(file),
				lineStream = byline.createStream(readStream),
				checksums = {},
				invalidChecksumLine = null

			readStream
			.on('error', reject)

			lineStream
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
					reject(new Error(`Invalid checksum line: ${invalidChecksumLine}`))
				}
			})
		})
	}

	parseChecksumLine_(line) {
		let matches = /^([a-f0-9]{32})\s+(?:\.\/)?(\S+)/i.exec(line)
		if (!matches)
			return null

		let md5 = matches[1],
			fileName = matches[2]
		return [md5, fileName]
	}
}
