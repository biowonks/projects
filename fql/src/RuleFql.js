'use strict'

module.exports =
/**
 * Object related to single instruction
 *
 * @constructor
 * @param {string?} optSequence defauls to the empty string
 */
class RuleFql {
	constructor(rule = {rule: [], pos: -1}) {
		if (rule.instructions)
			this.instructions = rule.instructions
		else
			this.instructions = []

		this.pos = rule.pos

		this.matches = []
		this.lowNumMatches = []
		this.highNumMatches = []
		this.isOk = true


		this.numOfIns = this.instructions.length
	}

	/**
	 * Find if certain rule will match the expression. (NEED TEST)
	 * @param {Object.Array} arrayInfo - Array containing the features of sequence.
	 * @param {number} startPos - Index where it will start looking for matches in the arrayInfo.
	 * @return {Array} Returns array of index that matches all instructions in the self set.
	 */

	findMatches(arrayInfo, startPos = NaN) {
		let matchArchive = [],
			isOk = true,
			commonMatches = [],
			lowNumMatches = [],
			highNumMatches = []

		// console.log('findMatches :: ' + ' - -- - ')

		for (let j = 0; j < this.numOfIns; j++) {
			let instr = this.instructions[j],
				matches = []

			lowNumMatches.push(instr[1][0])
			highNumMatches.push(instr[1][1])

			let negative = false
			if (highNumMatches[j] === 0 && lowNumMatches[j] === 0)
				negative = true

			// console.log('findMatches :: ' + '	Instruction -> ' + JSON.stringify(instr))

			for (let k = (startPos + 1 ? startPos + 1 : 0); k < arrayInfo.length; k++) {
				// console.log('findMatches :: ' + '	Test feature ' + k + ' -> ' + JSON.stringify(arrayInfo[k]))
				if (arrayInfo[k].match(instr[0]) && !(negative)) {
					if (matches.length === 0 || matches[matches.length - 1] === k - 1) {
						// console.log('findMatches :: ' + '	--> consecutive match') // Is it consecutive match
						matches.push(k)
					}
					else {
						// console.log('findMatches :: ' + '	--> not consecutive match - BREAKING')
						break
					}
				}
				else if (!(arrayInfo[k].match(instr[0])) && negative) {
					// console.log('findMatches :: ' + '	--> negative match')
					matches.push(k)
				}
				else {
					// console.log('findMatches :: ' + '	--> No match')
				}
			}
			// console.log('findMatches :: ' + '	Number of matches: ' + matches.length)
			// console.log('findMatches :: ' + '	Matches: ' + JSON.stringify(matches))
			// console.log('findMatches :: ' + '	Rule number: ' + this.pos)

			// console.log('findMatches :: Right before test if is wildcard or obey limits: isOk = ' + isOk)
			// console.log('findMatches :: remind the instruction = ' + JSON.stringify(instr))

			if (instr[0].indexOf('.*') !== -1)
				matches.splice(highNumMatches[j])

			// console.log('findMatches :: ' + '	high number ' + highNumMatches[j])
			// console.log('findMatches :: ' + '	low number: ' + lowNumMatches[j])
			// console.log('findMatches :: ' + '	matches: ' + JSON.stringify(matches))

			matchArchive.push({matches, negative})
			this.matches = matches
			// console.log('findMatches :: ' + '	pushed: ' + JSON.stringify(matchArchive[matchArchive.length - 1]))
			// console.log('findMatches :: ' + isOk)
		}

		// console.log('findMatches :: ' + 'Match Archive: ' + JSON.stringify(matchArchive))
		if (this.instructions.length > 1) {
			commonMatches = this._findCommonMatches(matchArchive)
			this.matches = commonMatches
		}
		this.lowNumMatches = lowNumMatches
		this.highNumMatches = highNumMatches
		this.isOk = isOk
	}

	/**
	 * Find the index of the last feature in the sequence to match a positional instruction.
	 * @param {Array.Object} matchArchive - Array containing the object of matches and isOk for each rule.
	 * @returns {Array} Return a list of match index common to all instructions in the rule.
	 */
	_findCommonMatches(matchArchive) {
		let listOfMatches = []
		// console.log(' _findCommonMatches ---> ' + JSON.stringify(matchArchive))
		for (let i = 0; i < matchArchive.length; i++)
			listOfMatches.push(matchArchive[i].matches)

		listOfMatches.sort((a, b) => {
			return a.length < b.length
		})
		// console.log(' _findCommonMatches ---> ' + '--')
		// console.log(' _findCommonMatches ---> ' + JSON.stringify(listOfMatches))
		// console.log(' _findCommonMatches ---> ' + '--')
		if (listOfMatches.length === 0)
			return []

		let common = []
		// console.log(' _findCommonMatches ---> ' + '-<> number of lists: ' + listOfMatches.length)
		if (listOfMatches.length > 1) {
			for (let i = 0; i < listOfMatches.length - 1; i++) {
				// console.log(' _findCommonMatches ---> ' + '=> match list 1: ' + listOfMatches[i])
				for (let j = 0; j < listOfMatches[i].length; j++) {
					let newValue = listOfMatches[i][j],
						numOfIns = 0
					// console.log(' _findCommonMatches ---> ' + '=> ' + j + ' matching value: ' + newValue)
					for (let k = i + 1; k < listOfMatches.length; k++) {
						// console.log(' _findCommonMatches -----> ' + '=> match list 2: ' + JSON.stringify(listOfMatches[k]))
						if (listOfMatches[k].indexOf(newValue) !== -1 || (listOfMatches[k].length === 0))
							numOfIns++
					}
					if (numOfIns + 1 === listOfMatches.length)
						common.push(newValue)
				}
			}
		}
		else if (listOfMatches.length === 1) {
			// console.log(' _findCommonMatches ---> ' + 'single list matches all')
			common = listOfMatches[0]
		}
		// console.log(' _findCommonMatches ---> ' + 'Return: ' +  JSON.stringify(common))
		return common
	}

	checkFirstRule(hardStart) {
		if (hardStart === true && this.pos === 0) {
			// console.log('checkFirstRule :: ' + JSON.stringify(this))
			let first = this.matches[0]
			if (first !== 0 || this.matches.length < this.lowNumMatches || this.matches.length > this.highNumMatches)
				this.isOk = false
		}
		else {
			// console.log('checkFirstRule :: Skipping')
		}
		// console.log('checkFirstRule :: ' + JSON.stringify(this))
		return this.isOk
	}

	checkNumMatches(checkHigh = true) {
		// console.log('checkNumMatches :: ' + JSON.stringify(this))
		for (let i = 0; i < this.numOfIns; i++) {
			// console.log('checkNumMatches :: ' + ' Instruction ' + i)
			// console.log('checkNumMatches :: this.matches.length < this.lowNumMatches[i] ')
			// console.log(this.matches.length < this.lowNumMatches[i])
			// console.log('checkNumMatches :: this.instructions[0].indexOf(".*") === -1 | this.matches.length > this.highNumMatches[i] | onlyLow ')
			// console.log( this.instructions[0].indexOf('.*') === -1 + ' ' + this.matches.length > this.highNumMatches[i] + ' ' + checkHigh)
			// console.log('checkNumMatches :: this.isOk === false ' + this.isOk === false)
			if (this.lowNumMatches[i] !== 0 && this.highNumMatches !== 0) {
				if (this.matches.length < this.lowNumMatches[i] || (this.instructions[0].indexOf('.*') === -1 && this.matches.length > this.highNumMatches[i] && checkHigh) || this.isOk === false) {
					// console.log('checkNumMatches :: ' + '	wrong number of matches - BREAKING ')
					this.isOk = false
					// console.log('checkNumMatches :: ' + JSON.stringify(this))
				}
				else {
					// console.log('wtf')
				}
			}
			// console.log('checkNumMatches :: ' + 'Deciding - ' + this.isOk)
		}
		return this.isOk
	}
}
