'use strict'

const Transform = require('stream').Transform

module.exports =
class Fql {
	constructor(initialAseqs = []) {
		this.input = {}
		this.sqlQuery = ''
		this.selection = initialAseqs
		this.rules = []
		this.match = []
		this.resources = []
	}
	/**
	* Load rules
	* @param {Object} rules array of feature request rules
	*/
	loadRules(rules) {
		this.rules = rules
		let resources = []
		rules.forEach((rule) => {
			this._isValidRule(rule)
			if (resources.indexOf(rule.resource) === -1)
				resources.push(rule.resource)
		})
		this.resources = resources
		return null
	}

	applyFilter(data) {
		let matchList = []
		data.forEach((info) => {
			let pInfo = this._preprocess(info)
			let match = false
		})
		return null
	}

	_preprocess(info) {
		let features = []
		this.resources.forEach((resource) => {
			let config = this._getConfig(resource)
			if ('t' in info.result) {
				if (resource in info.result.t) {
					info.result.t[resource].forEach((hit) => {
						let feature = {}
						feature['rc'] = resource
						feature['ft'] = hit[config.ft] ? hit[config.ft] : config.ft
						feature['pos'] = hit[config.pos]
						features.push(feature)
					})
				}
			}
		})
		features.sort((a, b) => {
			return a.pos - b.pos
		})
		console.log(features)
		let expression = ''
		features.forEach((feature) => {
			expression += feature.ft + '@' + feature.rc
		})
		return expression
	}
	/**
	* Get configuration to search each tool.
	* Better is to link this to SeqDepot via API - so changes there, change this too.
	* @param {string} Name of the resource
	* @return {Object} Object with attribute pos and ft with the indexes where to find this info in the array from each tool
	*/
	_getConfig(rc) {
		let config = {}
		if (rc.indexOf('pfam') !== -1) {
			config.pos = 1
			config.ft = 0
		}
		if (rc === 'das') {
			config.pos = 0
			config.ft = 'TM'
		}
		return config
	}

	_checkIfToolWasCalculated(info) {
		return true
	}


	_readRule(rule) {
		return null
	}

	_isValidRule(rule) {
		let noResource = true,
			noFeature = true

		if ('resource' in rule)
			noResource = false
		if ('feature' in rule)
			noFeature = false

		if (noResource && noFeature)
			throw new Error('Each rule must explicitly define a resource and feature')
		else if (noResource)
			throw new Error('Each rule must explicitly define a resource')
		else if (noFeature)
			throw new Error('Each rule must explicitly define a feature')

		return null
	}
}
