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
	_testPos(arrayInfo, parsedRules) {
		let indexInfo = 0,
			isOk = true

		console.log('\n This is the data: ' + JSON.stringify(arrayInfo))
		console.log(JSON.stringify(parsedRules))

		for (let i = 0; i < parsedRules.rules.length; i++) { // check each rule
			let isRuleOk = true,
				currRule = parsedRules.rules[i],
				nextRule = parsedRules.rules[i + 1],
				indexLastMatch = NaN,
				matchArchive = []

			console.log('Rule -> ' + JSON.stringify(currRule))

			currRule.forEach((instr) => { //check Instruction
				console.log('	Instruction -> ' + JSON.stringify(instr))
				let lowNumMatches = instr[1][0],
					highNumMatches = instr[1][1],
					indexInfoTemp = indexInfo,
					matches = []

				for (let j = indexInfoTemp; j < arrayInfo.length; j++) {
					if (arrayInfo[j].match(instr[0])) {
						if (matches.length === 0 || matches[matches.length - 1] === j - 1) // Is it consecutive match
							matches.push(j)
						else
							break
					}
				}
				console.log('	Number of matches: ' + matches.length)
				console.log('	Matches: ' + JSON.stringify(matches))
				if (parsedRules.hardStart === true && i === 0) {
					let first = matches[0]
					if (first !== 0 || matches.length < lowNumMatches || matches.length > highNumMatches)
						isOk = false
				}
				matchArchive.push({matches: matches, isOk: isOk})
				console.log(isOk)
			})
			indexLastMatch = matchArchive.forEach((match) => {

			})
		}
		console.log('	' + isOk)
		return isOk
	}

	/**
	 * Find the index of the last feature in the sequence to match a positional instruction. - Need its own test.
	 * @param {Array.Object} matchArchive - Array containing the object of matches and isOk for each rule.
	 * @returns {Array} Return a list of match index common to all instructions in the rule.
	 */
	_commonMatches(matchArchive) {
		let listOfMatches = matchArchive.map((matches) => {
				return matches.matches
			}),
			lowMatchNumber = Math.min.apply(Math, (listOfMatches.map((matches) => {
				return matches.length
			}))),
			common = []
		for (let i = 0; i < lowMatchNumber; i++) {
			let newValue = NaN
			for (let j = 0; j < listOfMatches.length; j++) {
				if (!(newValue)) {
					newValue = listOfMatches[j][i]
				}
				else if (newValue !== listOfMatches[j][i]) {
					newValue = NaN
					break
				}
			}
			if (newValue)
				common.push(newValue)
		}
		return common
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
				instructions = []
			rules.forEach((rule, i) => {
				if (rule.constructor === Object)
					instructions = [rule]
				else
					instructions = rule
				let parsed = []
				instructions.forEach((instr) => {
					expr = this._parseThePosInstruction(instr, i, rules.length)
					if (expr === 'hardStart')
						parsedRule.hardStart = true
					else if (expr === 'hardStop')
						parsedRule.hardStop = true
					else
						parsed.push(expr)
				})
				if (parsed.length !== 0)
					parsedRule.rules.push(parsed)
			})
		}
		else {
			parsedRule = null
		}
		return parsedRule
	}

	/**
	 * Loop to parse individual rules
	 * @param {Object} rule - Instruction to be parsed.
	 * @param {number} i - index of the rule
	 * @param {number} L - number of rules.
	 * @return {Object.Array|string} Parsed rule or
 	 */
	_parseThePosInstruction(rule, i, L) {
		let interval = [1, NaN],
			expr = ''
		if (rule.resource === 'fql') {
			if (rule.feature === '^' && i === 0)
				expr = 'hardStart'
			if (rule.feature === '$' && i === L - 1)
				expr = 'hardStop'
		}
		else {
			this._addResources(rule.resource)
			if ('count' in rule)
				interval = this._parseCount(rule.count)
			expr = [rule.feature + '@' + rule.resource, interval]
		}
		return expr
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
