'use strict'

module.exports =
/**ass of Feature Query Language */
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
	 * @returns {Boolean} - True if no problems occur.
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
			let arrayInfo = this._seqDepotInfoToArray(info),
				stringInfo = arrayInfo.join('')
			let isMatch = false,
				newMatch = true
			this.parsedRules.forEach((parsedRule) => {
				newMatch = true
				if (parsedRule.pos !== null)
					newMatch = this._testPos(arrayInfo, parsedRule.pos)
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
				if (rule[1] === '') {
					match = match && (stringInfo.indexOf(rule[0]) === -1 ? false : true)
				}
				else {
					let interval = rule[1].match('{([^}]+)}')[1].split(',')
					if (interval.length > 1) {
						if (interval[1] === '')
							interval[1] = Number.MAX_SAFE_INTEGER
						match = match && ((stringInfo.split(rule[0]).length - 1 >= parseInt(interval[0]) ? true : false) && (stringInfo.split(rule[0]).length - 1 <= parseInt(interval[1]) ? true : false))
					}
					else {
						match = match && stringInfo.split(rule[0]).length - 1 === parseInt(interval[0])
					}
				}
			})
		}
		return match
	}

	/**
	 * Test if the domain architecture of a sequence matches the filter.
	 * @param {string} stringInfo - domain architecture information in string.
	 * @param {string} regular expression type of rule
	 * @returns {Boolean} - True if matches
	 */
	_testPos(arrayInfo, instructions) {
		let match = false,
			indexInfo = 0,
			newIndexInfo = 0,
			numMatches = 0,
			nextRule = []

		let firstRule = instructions.rules[0],
			lastRule = instructions.rules[instructions.rules.length - 1],
			lowNumMatches = firstRule[1][0],
			highNumMatches = firstRule[1][1],
			indexInstr = 0,
			lastMatchIndex = 0

		//console.log('\n' + JSON.stringify(arrayInfo))
		//console.log(JSON.stringify(instructions))

		if (instructions.hardStart === true) {
			for (let j = indexInfo; j < arrayInfo.length; j++) {
				indexInfo = j
				if (arrayInfo[j].match(firstRule[0])) {
					numMatches++
					lastMatchIndex = j
					if (isNaN(highNumMatches)) {
						indexInfo++
						break
					}
				}
				else if (numMatches === 0) {
					return false
				}
				else {
					break
				}
			}

			//console.log('test instructions number ' + highNumMatches + ' ' + lowNumMatches + ' ' + numMatches)
			if (instructions.rules.length === 1) {
				if (instructions.hardStop === false && numMatches >= lowNumMatches)
					return true
				else if (isNaN(highNumMatches) && numMatches >= lowNumMatches && arrayInfo.length === lowNumMatches)
					return true
				else if (numMatches >= lowNumMatches && numMatches <= highNumMatches && arrayInfo.length >= lowNumMatches && arrayInfo.length <= highNumMatches)
					return true
				else
					return false
			}
			else if (numMatches < lowNumMatches || numMatches > highNumMatches) {
				return false
			}
			indexInstr++
		}



		//console.log('out of first loop ' + indexInstr + ' ' + indexInfo)
		for (let i = indexInstr; i < instructions.rules.length; i++) {
			//console.log('---')
			if (i !== instructions.rules.length - 1)
				nextRule = instructions.rules[i + 1]
			else
				nextRule = null

			let actuRule = instructions.rules[i]

			lowNumMatches = actuRule[1][0]
			highNumMatches = actuRule[1][1]
			numMatches = 0

			for (let j = indexInfo; j < arrayInfo.length; j++) {
				//console.log(arrayInfo[j])
				//console.log(actuRule[0])
				if (arrayInfo[j].match(actuRule[0])) {
					if (nextRule) {
						//console.log('nextRule exists')
						//console.log( arrayInfo[j] + ' - ' + nextRule[0])
						//console.log( arrayInfo[j-1] + ' - ' + nextRule[0])
						if (arrayInfo[j].match(nextRule[0]) && !(arrayInfo[j-1].match(nextRule[0]))) {
							//console.log('exiting via nextRule break')
							newIndexInfo = j
							break
						}
						else {
							numMatches++
							lastMatchIndex = j
							if (isNaN(highNumMatches))
								break
						}
					}
					else {
						numMatches++
						lastMatchIndex = j
						if (isNaN(highNumMatches))
							break
					}
				}
				else if (numMatches !== 0) {
					newIndexInfo = j
					break
				}
				//console.log(numMatches)
			}
			//console.log('out of the array loop')
			//console.log(actuRule[0])
			//console.log(numMatches)
			//console.log('last match: ' + lastMatchIndex)
			if (i + 1 === instructions.rules.length && numMatches > 0) {
				if (instructions.hardStop === false)
					return true
				else if (arrayInfo.length === newIndexInfo)
					return false
			}
			//console.log('out2')
			//console.log(newIndexInfo)
			if (numMatches >= lowNumMatches && isNaN(highNumMatches))
				match = true
			else if (numMatches >= lowNumMatches && numMatches <= highNumMatches)
				match = true
			indexInfo = newIndexInfo

			//console.log(match)
		}
		//console.log('got here')
		//console.log(match)
		//console.log(lastMatchIndex)
		//console.log(arrayInfo.length)
		if (instructions.hardStop === true) {
			if (lastMatchIndex === arrayInfo.length - 1 && isNaN(highNumMatches))
				match = true
			else if (lastMatchIndex === arrayInfo.length - 1 && numMatches >= lowNumMatches)
				match = true
			else
				return false
		}
		//console.log('endOfLoop')
		//console.log(match)
		return match
	}

	/**
	 * Add resource from rule to the array of resource used
	 * @param {string} resource - identifier of the resource
	 * @returns null
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
	 * @returns {Object} parsed - Same object but with the rules parsed
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
	 * @param {Object} rules - Rule of Npos type object
	 * @returns {Array.<Array>} regex - Array of [ String to match the domain architecture of sequences, string of interval of how many times it should appear ].
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
		else {
			parsedNposRule = null
		}
		return parsedNposRule
	}

	/**
	 * Parse pos type of rules.
	 * @param {Object} rules - Rule type obejct
	 * @returns {Object} Object with instructions for positional matching. There are three values:
	 * 	hardStart {Boolean} - true if matters that first rule match first info.
	 * rules {Object} - Array with rules
	 * hardStop {Boolean} - true if matters that the last rule match last info.
	 */
	_parsePosRules(rules) {
		let parsedRule = {
			hardStart: false,
			rules: [],
			hardStop: false
		}
		if (rules) {
			let expr = '',
				count = 1,
				interval = []
			rules.forEach((rule, i) => {
				interval = [1, NaN]
				if (rule.resource === 'fql') {
					if (rule.feature === '^' && i === 0) {
						parsedRule.hardStart = true
					}
					if (rule.feature === '$' && i === rules.length - 1) {
						parsedRule.hardStop = true
					}
				}
				else {
					this._addResources(rule.resource)

					if ('count' in rule)
						interval = this._parseCount(rule.count)
					expr = [rule.feature + '@' + rule.resource, interval]
					parsedRule.rules.push(expr)
				}
			})
		}
		else {
			parsedRule = null
		}
		return parsedRule
	}

	/**
	 * Parse RegEx-like repeat info.
	 * @param {string} countString - RegEx formated count string
	 * @returns {Object} Returns an array (lentgh 2) with the interval to be used. Infinity is used in the second item in case a 'at least` statement is passed. Ex.: {3,} - at least 3.
	 */
	_parseCount(countString) {
		let toBeParsed = countString
			.replace('{', '')
			.replace('}', '')
			.split(','),
			intervalMaxLength = 2,
			interval = []
		if (toBeParsed.length > intervalMaxLength)
			throw new Error('Invalid count value (too many commas): ' + countString)
		toBeParsed.forEach((n, i) => {
			if (n.match(/^\d+$/))
				interval.push(parseInt(n))
			else if (n === '' && i !== 0)
				interval.push(Infinity)
			else if (n === '' && i === 0)
				interval.push(0)
			else
				throw new Error('Invalid count value (only integers): ' + countString)
		})
		if (interval.length === 1)
			interval.push(interval[0])
		return interval
	}

	/**
	 * Parse SeqDepot type of domain architecture response.
	 * @param {string} info - SeqDepot-formated feature information
	 * @returns {Object} Returns an array with features information formated as: feature@resource
	 */
	_seqDepotInfoToArray(info) {
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
		let expression = []
		features.forEach((feature) => {
			expression.push(feature.ft + '@' + feature.rc)
		})
		return expression
	}
	/**
	* Get configuration to search each tool.
	* Better is to link this to SeqDepot via API - so changes there, change this too.
	* @param {string} Name of the resource
	* @returns {Object} Object with attribute pos and ft with the indexes where to find this info in the array from each tool
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
