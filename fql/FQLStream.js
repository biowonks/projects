'use strict'

let Fql = require('./FQLService.js'),
	Transform = require('stream').Transform,
	bunyan = require('bunyan')

let nItemsDefault = 10

module.exports =
/**
 * Class of Feature Query Language
 * */
class FqlStream extends Transform {
	constructor(rules, ruleId = 0, objectMode = true, nItems = nItemsDefault) {
		super({objectMode: true})
		this.fql = new Fql()
		this.fql.loadRules(rules)
		this.ruleId = ruleId
		this.itemNum = 0
		this.itemIn = 0
		this.nItems = nItems
		this.buffer = []
		this.log = bunyan.createLogger({name: 'FqlFilter.app'})
		this.log.info('Starting Fql filtering')
		this.objectMode = objectMode
	}

	_transform(chunk, enc, done) {
		//console.log('\n**\n' + JSON.stringify(chunk) + '\n*\n')
		this.buffer.push(chunk)
		if (this.buffer.length >= this.nItems) {
			let toProcess = this.buffer.splice(0, this.nItems)
			this.itemNum += toProcess.length
			this.log.info('processing %s items to a total of %s', toProcess.length, this.itemNum)
			this.fql.applyFilter(toProcess)
			let filterIn = 0
			let toPush = []
			this.fql.match.forEach((match, i) => {
				if (match) {
					filterIn++
					if (toProcess.match)
						toProcess[i].fqlMatch.push(this.ruleId)
					else
						toProcess[i]['fqlMatch'] = [this.ruleId]
				}
				toPush.push(toProcess[i])
			})
			this.push(toPush)
			this.itemIn += filterIn
			this.log.info('Filtered in %s items to a total of %s', filterIn, this.itemIn)
		}
		done()
	}

	_flush(done) {
		// console.log('\n**\n' + JSON.stringify(chunk) + '\n*\n')
		let toProcess = this.buffer.splice(0, this.nItems)

		this.itemNum += toProcess.length
		this.log.info('processing %s items to a total of %s', toProcess.length, this.itemNum)
		this.fql.applyFilter(toProcess)
		// console.log(this.fql.match)
		let filterIn = 0
		this.fql.match.forEach((match, i) => {
			if (match) {
				filterIn++
				this.push(JSON.stringify(toProcess[i]))
			}
		})
		this.itemIn += filterIn
		this.log.info('Filtered in %s items to a total of %s', filterIn, this.itemIn)
		done()
	}
}
