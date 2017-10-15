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
		this.fqlService = new FQLService(this.setsOfRules)
		this.fqlService.initRules()
	}

	_transform(chunk, enc, next) {
		this.numItems++
		if (this.numItems % this.progressReportNumber === 0)
			this.log.info(this.numItems + ' have been processed')
		this.push(this.fqlService.findMatches(chunk))
	}
}
