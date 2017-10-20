'use strict'

const csv = require('csvtojson'),
	path = require('path')

const DefaultTableFilePath = path.resolve(__dirname, '..', 'signal-transduction', 'mist3-sig-trans-2017.csv')


module.exports =
class SignalTransductionService {
	constructor(tableFilePath) {
		this.tableFilePath = tableFilePath ? tableFilePath : DefaultTableFilePath
		this.pfql = []
		this.sigData = []
	}

	parseTable_() {
		return new Promise((res, rej) => {
			csv().fromFile(this.tableFilePath)
				.on('json', (item) => {
					this.pfql.push(this.makePFQLrule(item.domain_name, item.source))
					this.sigData.push(item)
				})
				.on('end', () => {
					res()
				})
				.on('error', (err) => {
					rej(err)
				})
		})
	}

	makePFQLrule(feature, resource) {
		let PFQLrule = [
			{
				Npos: [
					{
						resource,
						feature
					}
				]
			}
		]
		return PFQLrule
	}
}
