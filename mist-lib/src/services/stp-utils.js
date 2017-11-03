'use strict'

const csv = require('csvtojson')

exports.parseCSVTable = (tableFilePath) => {
	return new Promise((resolve, reject) => {
		let pfqlRules = []
		csv().fromFile(tableFilePath)
			.on('json', (item) => {
				pfqlRules.push(makeSimpleNPosPFQLRule(item.domain_name, item.source, item))
			})
			.on('end', () => {
				resolve(pfqlRules)
			})
			.on('error', (err) => {
				reject(err)
			})
	})
}

function makeSimpleNPosPFQLRule(feature, resource, meta) {
	let PFQLRule = {
		meta,
		rules: [
			{
				Npos: [
					{
						resource,
						feature
					}
				]
			}
		]
	}
	return PFQLRule
}
