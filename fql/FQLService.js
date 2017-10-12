'use strict'

let RuleFql = require('./RuleFql.js')

module.exports =
/**
 * Class of Feature Query Language
 *
 * Service to process a given domain
 * architecture and verify its matches
 * against N rules
 *
 * */
class FQLService {
	constructor(setsOfRules = false) {
		this.setsOfRules = setsOfRules
		this.parsedSetsOfRules = []
	}

	/**
	 * Load and parse the set of rules passed by the user in FQL standards.
	 * The keys of the object that will be interpreted are two: Npos and pos. Everything else will be ignored.
	 * Example of rule:
	 * Find if certain rule will match the expression. (NEED TEST)
	 * @param {Array.Objects} - Raw set of rules object
	 * @return {Boolean} - True if no problems occur.
	 */
	initRules() {
		return new Promise((resolve, reject) => {
			if (this.setsOfRules) {
				this.resources = [...Array(this.setsOfRules.length).keys()].map((i) => [])
				this.setsOfRules.forEach((setOfRules, ruleIndex) => {
					let parsedRules = []
					setOfRules.forEach((rules) => {
						this._isValidRule(rules)
						parsedRules.push(this._parseRules(rules, ruleIndex))
					})
					this.parsedSetsOfRules.push(parsedRules)
				})
				resolve()
			}
			else {
				reject(new Error('No rules have been passed in the constructor'))
			}
		})
	}

	findMatches(item) {
		return new Promise((resolve, reject) => {
			let matchList = []
			this.parsedSetsOfRules.forEach((parsedRules, ruleIndex) => {
				let DAarrayInfo = this._seqDepotInfoToArray(item, ruleIndex),
					DAstringInfo = DAarrayInfo.join('')
				let isMatch = false,
					newMatch = true
				parsedRules.forEach((parsedRule) => {
					newMatch = true
					if (parsedRule.pos !== null)
						newMatch = this._testPos(DAarrayInfo, parsedRule.pos)
					if ('Npos' in parsedRule)
						newMatch = newMatch && this._testNpos(DAstringInfo, parsedRule.Npos)
					isMatch = isMatch || newMatch
				})
				if (isMatch)
					matchList.push(ruleIndex)
			})
			item.FQLMatches = matchList
			resolve(item)
		})
	}

	_testNpos(stringInfo, rules) {
		let match = true
		if (rules) {
			rules.forEach((rule) => {
				if (rule[1] === '') {
					match = match && stringInfo.indexOf(rule[0]) !== -1
				}
				else {
					let interval = rule[1].match('{([^}]+)}')[1].split(',')
					if (interval.length > 1) {
						if (interval[1] === '')
							interval[1] = Number.MAX_SAFE_INTEGER
						match = match && (stringInfo.split(rule[0]).length - 1 >= parseInt(interval[0]) && (stringInfo.split(rule[0]).length - 1 <= parseInt(interval[1])))
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
	 * @param {string} arrayInfo - domain architecture information in string.
	 * @param {Object} parsedRules - Object containing the rules
	 * @returns {Boolean} - True if matches
	 */
	_testPos(arrayInfo, parsedRules) {
		let indexLastMatch = NaN,
			isOk = true

		// console.log('_testPos :: ' + '-------------------------------------------------------------------------------------------------')
		// console.log('_testPos :: ' + ' This is the data: ' + JSON.stringify(arrayInfo))
		// console.log('_testPos :: ' + JSON.stringify(parsedRules))

		for (let i = 0; i < parsedRules.rules.length; i++) { // check each rule
			let currRule = new RuleFql({instructions: parsedRules.rules[i], pos: i}),
				nextRule = new RuleFql({instructions: parsedRules.rules[i + 1], pos: i + 1}),
				classifiedMatches = {hard: [], soft: [], next: []}

			// console.log('_testPos :: ' + 'Rule -> ' + JSON.stringify(currRule))


			currRule.findMatches(arrayInfo, indexLastMatch)
			isOk = currRule.isOk

			// console.log('_testPos :: ' + 'Common matches - ' + JSON.stringify(currRule.matches))
			// console.log('_testPos :: ' + 'lastmatch: ' + indexLastMatch)
			// console.log('_testPos :: ' + 'not consecutive match: ' + (currRule.matches[0] - 1 !== indexLastMatch))

			if (indexLastMatch && (currRule.matches[0] - 1 !== indexLastMatch))
				isOk = false

			if (nextRule.instructions && currRule.matches.length !== 0) {
				// console.log('_testPos :: ' + ' ----- NEXT RULE -----')
				if (isNaN(indexLastMatch))
					nextRule.findMatches(arrayInfo, 0)
				else
					nextRule.findMatches(arrayInfo, indexLastMatch + 1)
				// console.log('_testPos :: ' + 'Next Rule - Common matches - ' + JSON.stringify(nextRule.matches))
				// console.log('_testPos :: ' + 'Next Rule - not consecutive match: ' + (nextRule.matches[0] - 1 !== currRule.matches[currRule.matches.length - 1]))

				classifiedMatches = this._classifyMatches(currRule, nextRule)

				// console.log('_testPos :: ' + ' Classifying matches: ' + JSON.stringify(classifiedMatches))

				let foundMatch = false

				for (let j = 0; j < classifiedMatches.soft.length + 1; j++) {
					currRule.isOk = true
					// console.log('_testPos :: matches to curr rule : ' + JSON.stringify(classifiedMatches.hard.concat(classifiedMatches.soft.slice(0, j))))
					// console.log('_testPos :: matches to next rule : ' + JSON.stringify(classifiedMatches.soft.slice(j, classifiedMatches.soft.length).concat(classifiedMatches.next)))
					currRule.matches = classifiedMatches.hard.concat(classifiedMatches.soft.slice(0, j))
					nextRule.matches = classifiedMatches.soft.slice(j, classifiedMatches.soft.length).concat(classifiedMatches.next)

					// console.log('_testPos :: ' + 'Current rule -> ' + JSON.stringify(currRule))
					// console.log('_testPos :: ' + 'Next Rule -> ' + JSON.stringify(nextRule))

					if (currRule.pos === 0) {
						// console.log('_testPos :: ' + 'Testing first rule')
						currRule.checkFirstRule(parsedRules.hardStart)
						// nextRule.checkFirstRule(parsedRules.hardStart)
					}
					else {
						// console.log('_testPos :: ' + 'Testing the other rules')
						currRule.checkNumMatches()
						nextRule.checkNumMatches(false)
					}
					// console.log('_testPos :: ' + 'Current rule -> ' + JSON.stringify(currRule))
					// console.log('_testPos :: ' + 'Next Rule -> ' + JSON.stringify(nextRule))
					if (currRule.isOk && nextRule.isOk) {
						// indexLastMatch = currRule.matches[currRule.matches.length - 1]
						// //// console.log('_testPos :: ' + 'lastmatch: ' + indexLastMatch)
						foundMatch = true
						break
					}
				}
				if (foundMatch)
					isOk = true
				// console.log('_testPos :: ' + ' ----- END of NEXT RULE -----')
			}

			// console.log('_testPos :: ' + 'New common matches after next rule: ' + JSON.stringify(currRule.matches))

			// console.log('_testPos :: ' + ' Now, let\'s make the test about the number of matches of the special first rule')
			// console.log('_testPos :: ' + 'Rule -> ' + JSON.stringify(currRule))
			if (!(currRule.checkFirstRule(parsedRules.hardStart))) {
				isOk = currRule.isOk
				break
			}

			// console.log('_testPos :: ' + ' And check if the number of matches are within the interval')
			if (!(currRule.checkNumMatches())) {
				isOk = currRule.isOk
				break
			}

			if (currRule.matches.length === 0) {
				// console.log('_testPos :: ' + ' False by having no matches')
				isOk = false
				break
			}

			if (!(isNaN(indexLastMatch))) {
				// console.log('_testPos :: ' + ' is still ok? : ' + isOk)
				// console.log('_testPos :: ' + ' final match : ' + currRule.matches[0])
				// console.log('_testPos :: ' + ' last index : ' + indexLastMatch)
				if (isOk === false || currRule.matches === [] || currRule.matches[0] - 1 !== indexLastMatch) {
					// console.log('_testPos :: ' + ' False by having no consecutive match')
					isOk = false
					break
				}
			}
			// console.log('_testPos :: ' + 'List of matches: ' + JSON.stringify(currRule.matches))
			indexLastMatch = currRule.matches[currRule.matches.length - 1]
			// console.log('_testPos :: ' + 'New last match: ' + indexLastMatch)
			if (parsedRules.hardStop === true && i === parsedRules.rules.length - 1) {
				if (indexLastMatch !== arrayInfo.length - 1)
					isOk = false
			}

			if (isOk === false)
				break
		}
		// console.log('_testPos :: ' + 'FINAL = ' + isOk)
		return isOk
	}

	/**
	 * Classify matches into hard and soft matches.
	 * @param {RuleFql} currRule - Current Rule
	 * @param {RuleFql} nextRule - Next rule
	 * @returns {Object} { hard: [], soft: []}
	 */

	_classifyMatches(currRule, nextRule) {
		let hard = [],
			soft = [],
			next = []

		for (let i = 0; i < currRule.matches.length; i++) {
			if (nextRule.matches.indexOf(currRule.matches[i]) === -1)
				hard.push(currRule.matches[i])
			else
				soft.push(currRule.matches[i])
		}
		for (let i = 0; i < nextRule.matches.length; i++) {
			if (soft.indexOf(nextRule.matches[i]) === -1)
				next.push(nextRule.matches[i])
		}
		hard = this._cleanMatches(hard)
		soft = this._cleanMatches(soft)
		next = this._cleanMatches(next)
		return {
			hard,
			soft,
			next
		}
	}

	_cleanMatches(matches) {
		let newMatches = []
		matches.forEach(function(match) {
			if (newMatches.length === 0)
				newMatches.push(match)
			else if (match === newMatches[newMatches.length - 1] + 1)
				newMatches.push(match)
		})
		return newMatches
	}

	/**
	 * Add resource from rule to the array of resource used
	 * @param {string} resource - identifier of the resource
	 * @returns {null}
	 */
	_addResources(resource, ruleIndex) {
		if (this.resources[ruleIndex].indexOf(resource) === -1)
			this.resources[ruleIndex].push(resource)
		return null
	}

	_getFeatures(rules) {
		return null
	}

	/**
	 * Parse filtering rules passed by the user
	 * @param {Object} rules - Raw rules object passed to FQL
	 * @returns {Object} parsed - Same object but with the rules parsed
	 */
	_parseRules(rules, ruleIndex) {
		let parsed = {
			pos: this._parsePosRules(rules.pos, ruleIndex),
			Npos: this._parseNPosRules(rules.Npos, ruleIndex)
		}
		return parsed
	}

	/**
	 * Parse pos type of rules. It will also populate the this.resources with the resources found here.
	 * @param {Object} rules - Rule of Npos type object
	 * @returns {Array.<Array>} regex - Array of [ String to match the domain architecture of sequences, string of interval of how many times it should appear ].
	 */
	_parseNPosRules(rules, ruleIndex) {
		let parsedNposRule = []
		if (rules) {
			let expr = ''
			let count = ''
			rules.forEach((rule) => {
				if (rule.feature === '.*')
					rule.feature = ''
				expr = rule.feature + '@' + rule.resource
				if ('count' in rule)
					count = rule.count
				parsedNposRule.push([expr, count])
				this._addResources(rule.resource, ruleIndex)
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
	_parsePosRules(rules, ruleIndex) {
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
					expr = this._parseThePosInstruction(instr, i, rules.length, ruleIndex)
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
		if (parsedRule && parsedRule.hardStart === true && parsedRule.hardStop === true) {
			for (let i = 0; i < parsedRule.rules.length; i++) {
				for (let j = 0; j < parsedRule.rules[i].length; j++) {
					if (isNaN(parsedRule.rules[i][j][1][1]))
						parsedRule.rules[i][j][1][1] = 1
				}
			}
		}
		return parsedRule
	}

	/**
	 * Loop to parse individual rules
	 * @param {Object} rule - Instruction to be parsed.
	 * @param {number} i - index of the rule
	 * @param {number} L - number of rules.
	 * @returns {Object.Array|string} Parsed rule or
 	 */
	_parseThePosInstruction(rule, i, L, ruleIndex) {
		let interval = [1, NaN],
			expr = ''
		if (rule.resource === 'fql') {
			if (rule.feature === '^' && i === 0)
				expr = 'hardStart'
			if (rule.feature === '$' && i === L - 1)
				expr = 'hardStop'
		}
		else {
			this._addResources(rule.resource, ruleIndex)
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
	_seqDepotInfoToArray(info, ruleIndex) {
		let features = []
		let config = {}
		this.resources[ruleIndex].forEach((resource) => {
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
		let expressions = []
		features.forEach((feature) => {
			expressions.push(feature.ft + '@' + feature.rc)
		})
		return expressions
	}
	/**
	* Get configuration to search each tool.
	* Better is to link this to SeqDepot via API - so changes there, change this too.
	* @param {string} rc - Name of the resource
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

	/**
	 * Validates rules passed by user
	 * @param {Object} rule - Pass the object with Npos and pos rules
	 * @throws {Error} If rule is missing feature, resource or both
	 * @returns {Null}
	 */

	_isValidRule(rule) {
		if ('pos' in rule) {
			rule.pos.forEach((posRules) => {
				let posRulesFixed = posRules
				if (posRules.constructor === Object)
					posRulesFixed = [posRules]

				posRulesFixed.forEach((posRule) => {
					let noResource = true,
						noFeature = true

					let values = Object.keys(posRule).map((key) => posRule[key])
					values.forEach((value) => {
						if (value === '*')
							throw new Error('Wrong wild card. Change "*" to ".*" in:\n' + JSON.stringify(posRule))
					})


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
			})
		}
		if ('Npos' in rule) {
			rule.Npos.forEach((nposRule) => {
				let noResource = true,
					noFeature = true

				let values = Object.keys(nposRule).map((key) => nposRule[key])
				values.forEach((value) => {
					if (value === '*')
						throw new Error('Wrong wild card. Change "*" to ".*" in:\n' + JSON.stringify(nposRule))
				})

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
