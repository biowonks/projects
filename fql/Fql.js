'use strict'

module.exports =
/** Class of Feature Query Language */
class Fql {
	constructor(initialAseqs = []) {
		this.input = {}
		this.sqlQuery = ''
		this.selection = initialAseqs
		this.rules = []
		this.match = []
		this.resources = []
		this.parsedRules = []
	}

	/**
	 * Load and parse the set of rules passed by the user in FQL standards.
	 * 
	 * The keys of the object that will be interpreted are two: Npos and pos. Everything else will be ignored.
	 * 
	 * Example of rule:
	 * 
	 * 
	 * 
	 * @param {Array{Objects}} - Raw set of rules object
	 * @return {Boolean} - True if no problems occur.
	 */
	loadRules(setOfRules) {
		this.rules = setOfRules
		this.resources = []
		this.parsedRules = []
		let resources = []
		setOfRules.forEach((rules) => {
			this._isValidRule(rules)
			this.parsedRules.push(this._parseRules(rules))
		})
		return null
	}

	applyFilter(data) {
		let matchList = []
		data.forEach((info) => {
			let stringInfo = this._seqDepotInfoToString(info)
			let isMatch = false,
				newMatch = true
			this.parsedRules.forEach((parsedRule) => {
				newMatch = true
				if ( parsedRule.pos !== null)
					newMatch = this._testPos(stringInfo, parsedRule.pos) 
				if ('Npos' in parsedRule)
					newMatch = newMatch && this._testNpos(stringInfo, parsedRule.Npos)
				isMatch = isMatch || newMatch
			})
			matchList.push(isMatch)
		})
		this.match = matchList
		return matchList
	}

	_testNpos(stringInfo, rules) {
		let match = true
		if (rules) {
			rules.forEach((rule) => {
				if (rule[1] == '')
					match = match && ( stringInfo.indexOf(rule[0]) === -1 ? false : true )
				else {
					let interval = rule[1].match('\{([^}]+)\}')[1].split(',')
					if (interval.length > 1) {
						if (interval[1] === '')
							interval[1] = Number.MAX_SAFE_INTEGER
						match = match && ( (stringInfo.split(rule[0]).length - 1 >= parseInt(interval[0]) ? true : false ) && (stringInfo.split(rule[0]).length - 1 <= parseInt(interval[1]) ? true : false ))
					}
					else
						match = match && stringInfo.split(rule[0]).length - 1 === parseInt(interval[0])
				}
			})
		}
		return match
	}

	_testPos(stringInfo, regex) {
		return stringInfo.match(regex) ? true : false
	}

	/**
	 * Add resource from rule to the array of resource used
	 * @param {string} resource - identifier of the resource
	 * @return null
	 */
	_addResources(resource) {
		if (this.resources.indexOf(resource) === -1)
			this.resources.push(resource)
		return null
	}

	_getFeatures(rules) {
		return null
	}

	/**
	 * Parse filtering rules passed by the user
	 * @params {Object} rules - Raw rules object passed to FQL
	 * @return {Object} parsed - Same object but with the rules parsed 
	 */
	_parseRules(rules) {
		let parsed = { 
			pos: this._parsePosRules(rules.pos),
			Npos: this._parseNPosRules(rules.Npos)
		}
		return parsed
	}

	/**
	 * Parse pos type of rules. It will also populate the this.resources with the resources found here.
	 * @params {Object} rules - Rule of Npos type object
	 * @return {Array.<Array>} regex - Array of [ String to match the domain architecture of sequences, string of interval of how many times it should appear ].
	 */
	_parseNPosRules(rules) {
		let parsedNposRule = []
		if (rules) {
			let expr = ''
			let count = ''
			rules.forEach((rule) => {
				expr = rule.feature + '@' + rule.resource
				if ('count' in rule)
					count = rule.count
					parsedNposRule.push([expr, count])
				this._addResources(rule.resource)
			})
		}
		else
			parsedNposRule = null
		return parsedNposRule
	}

	/**
	 * Parse pos type of rules.
	 * @params {Object} rules - Rule type obejct
	 * @return {string} regex - Regular expression to match the domain architecture of sequences.
	 */
	_parsePosRules(rules) {
		let regex = ''
		if (rules) {
			let expr = ''
			rules.forEach((rule) => {
				if (rule.resource === 'fql') {
					expr = rule.feature
				}	
				else {
					this._addResources(rule.resource)
					expr = '(' + rule.feature + '@' + rule.resource + ')'
					if ('count' in rule)
						expr = expr + rule.count + '(?!' + rule.feature + '@' + rule.resource + ')'
				}
				regex += expr
			})
		}
		else
			regex = null
		return regex
	}

	_seqDepotInfoToString(info) {
		let features = []
		let config = {}
		this.resources.forEach((resource) => {
			config = this._getConfig(resource)
			if ('t' in info.result) {
				if (resource in info.result.t) {
					info.result.t[resource].forEach((hit) => {
						let feature = {}
						feature.rc = resource
						feature.ft = hit[config.ft] ? hit[config.ft] : config.ft
						feature.pos = hit[config.pos]
						features.push(feature)
					})
				}
			}
		})
		features.sort((a, b) => {
			return a.pos - b.pos
		})
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
		if (rc) {
			if (rc.indexOf('pfam') !== -1) {
				config.pos = 1
				config.ft = 0
			}
			if (rc === 'das') {
				config.pos = 0
				config.ft = 'TM'
			}
		}
		return config
	}

	_checkIfToolWasCalculated(info) {
		return true
	}


	_readRule(rule) {
		return null
	}

	/**
	 * Validates rules passed by user
	 * @param {Object} rule - Pass the object with Npos and pos rules
	 * @throws {Error} If rule is missing feature, resource or both
	 * @return
	 */

	_isValidRule(rule) {
		if ('pos' in rule) {
			rule.pos.forEach((posRule) => {
				let noResource = true,
					noFeature = true

				if ('resource' in posRule)
					noResource = false
				if ('feature' in posRule)
					noFeature = false

				if (noResource && noFeature)
					throw new Error('Each pos rule must explicitly define a resource and feature: \n' + JSON.stringify(posRule))
				else if (noResource)
					throw new Error('Each pos rule must explicitly define a resource: \n' + JSON.stringify(posRule))
				else if (noFeature)
					throw new Error('Each pos rule must explicitly define a feature: \n' + JSON.stringify(posRule))
			})
		}
		if ('Npos' in rule) {
			rule.Npos.forEach((nposRule) => {
				let noResource = true,
					noFeature = true

				if ('resource' in nposRule)
					noResource = false
				if ('feature' in nposRule)
					noFeature = false

				if (noResource && noFeature)
					throw new Error('Each Npos rule must explicitly define a resource and feature: \n' + JSON.stringify(nposRule))
				else if (noResource)
					throw new Error('Each Npos rule must explicitly define a resource: \n' + JSON.stringify(nposRule))
				else if (noFeature)
					throw new Error('Each Npos rule must explicitly define a feature: \n' + JSON.stringify(nposRule))
			})
		}
		return null
	}
}
