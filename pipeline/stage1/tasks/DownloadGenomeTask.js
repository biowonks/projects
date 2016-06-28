'use strict'

// Vendor
const Promise = require('bluebird')

// Local
const NCBIDataHelper = require('../NCBIDataHelper'),
	AbstractTask = require('./AbstractTask')

// Constants
const kDataSourceTypes = ['assembly-report', 'genomic-genbank']

module.exports =
class DownloadGenomeTask extends AbstractTask {
	constructor(...params) {
		super(...params)
		this.ncbiDataHelper_ = new NCBIDataHelper(this.fileMapper_, this.logger_)
	}

	isAlreadyDone() {
		let self = this
		return Promise.coroutine(function *() {
			for (let sourceType of kDataSourceTypes) {
				let isDownloaded = yield self.ncbiDataHelper_.isDownloaded(sourceType)
				if (!isDownloaded)
					return false
				self.interruptCheck()
			}
			return true
		})()
	}

	run() {
		let self = this
		return Promise.coroutine(function *() {
			for (let sourceType of kDataSourceTypes) {
				yield self.ncbiDataHelper_.download(sourceType)
				self.interruptCheck()
			}
		})()
	}
}
