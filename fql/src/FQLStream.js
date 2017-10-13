'use strict'

let FQLService = require('./FQLService.js'),
	Transform = require('stream').Transform,
	bunyan = require('bunyan')

let progressReportNumber = 1000

module.exports =
/**
 * Class of Feature Query Language
 * */
class FQLStream extends Transform {
	constructor(setsOfRules) {
		super({objectMode: true})
		this.setsOfRules = setsOfRules
		this.log = bunyan.createLogger({name: 'FQLStream'})
		this.log.info('start')
		this.numItems = 0
		this.progressReportNumber = progressReportNumber
	}

	initStream() {
		return new Promise((res, rej) => {
			this.fqlService = new FQLService(this.setsOfRules)
			this.fqlService.initRules().then(() => {
				this.log.info('rules are loaded')
				res()
			})
			.catch((err) => {
				rej(err)
			})
		})
	}

	_transform(chunk, enc, next) {
		this.fqlService.findMatches(chunk).then((item) => {
			this.numItems++
			if (this.numItems % this.progressReportNumber === 0)
				this.log.info(this.numItems + ' have been processed')
			this.push(item)
			next()
		})
	}
}
