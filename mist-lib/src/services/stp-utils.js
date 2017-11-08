'use strict'

const csv = require('csvtojson')

/**
 * @module readPFQLRulesFromCSVFile
 *
 * Read CVS file with protein family definitions and build equivalent PFQL compatible rules
 *
 * @param {string} [tableFilePath] Path to the CSV table
 * @return {Promise}
 */
exports.readPFQLRulesFromCSVFile = (tableFilePath) => {
	return new Promise((resolve, reject) => {
		const pfqlRules = []
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


/**
 * Make non-positional PFQL rule out of definitions of single feature with single resource
 *
 * @param {String} [feature='']
 * @param {String} [resource='']
 * @param {Object} [meta={}]
 * @returns {Object} PFQLRule
 */
function makeSimpleNPosPFQLRule(feature = '', resource = '', meta = {}) {
	const PFQLRule = {
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
