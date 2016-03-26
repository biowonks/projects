'use strict'

// Core node libraries
let assert = require('assert'),
	crypto = require('crypto')


module.exports =
class HmmscanResult {
	constructor(hmmscanResultText){
		this.lines = hmmscanResultText.split('\n')
		this.currentDomain = ''
		this.domains = []

		this.readHeader_()
		this.readUnitHits_()
	}

	regex2checkAndList_(string, regex, variables){
		if (!string)
			string = ''
		let theList = string.match(regex)
		if(theList) {
			for (let i = 1; i < theList.length ; i++) {
				this[variables[i-1]] = theList[i]
			}
			return true
		}
	}

	readHeader_(){
		let linesLength = this.lines.length
		for (let i = 0; i < linesLength; i++){
			let currentLine = this.lines[i]
			if(this.regex2checkAndList_(currentLine, /^Query:\s+(\S+)\s+\[L\=(\d+)\]/, ['seqName', 'seqLength']))
				this.lines =  this.lines.slice(i + 1, linesLength)
		}
		assert(this.seqName, "Sequence Name was not found.")
	}

	readUnitHits_(){

		for (let i = 0; i < this.lines.length; i++){
			let currentLine = this.lines[i]
			if (this.regex2checkAndList_(currentLine, /^[(\/\/|Internal)]/, [])) {

				delete this.lines
				delete this.currentDomain
				this.domains.sort(function(a,b) {return (a.c_evalue > b.c_evalue) ? 1 : ((b.c_evalue > a.c_evalue) ? -1 : 0);} )
				break
			}
			else if (this.regex2checkAndList_(currentLine, /^\>\>\s+(\S+)/, ['currentDomain'])) {
				continue
			}
			// else if (this.regex2checkAndList_(currentLine, /^\s+Alignments for each domain:/, [])) {
			// 	continue
			// }
			// else if (this.regex2checkAndList_(currentLine, /^\s+(#\s+score|---)/, [])) {
			// 	continue
			// }
			else if (this.regex2checkAndList_(currentLine, /^$/, [])) {
				continue
			}
			else 	if (this.regex2checkAndList_(currentLine, /^\s+\d+\s+!/, [])) {
	
				let dMatch = currentLine.split(/\s+/)
				assert(dMatch.length == 17, 'Expected 16 elements of data ' + currentLine + '\n')
			
				this.domains.push({
					name		: this.currentDomain,
					score		: parseFloat(dMatch[3]),
					bias		: parseFloat(dMatch[4]),
					c_Evalue	: parseFloat( dMatch[5]),
					i_Evalue	: parseFloat(dMatch[6]),
					hmmfrom		: parseInt(dMatch[7]),
					hmm_to		: parseInt(dMatch[8]),
					hmmCov		: dMatch[9],
					alifrom		: parseInt(dMatch[10]),
					ali_to		: parseInt(dMatch[11]),
					aliCov		: dMatch[12],
					envfrom		: parseInt(dMatch[13]),
					env_to		: parseInt(dMatch[14]),
					envCov		: dMatch[15],
					acc			: parseFloat(dMatch[16])
				})

				continue
			}
			// else if (this.regex2checkAndList_(currentLine, /^Scores for complete/, [])) {
			// 	continue
			// }
			// else if (this.regex2checkAndList_(currentLine, /^    E-value  score/, [])) {
			// 	continue
			// }
			// else if (this.regex2checkAndList_(currentLine, /^    ------- ------/, [])) {
			// 	continue
			// }
			// else if (this.regex2checkAndList_(currentLine, /^\s+\[No individual domains/, [])) {
			// 	continue
			// }
			// else {
			// 	assert(false, 'Did not parse line: ' + currentLine)
			// }
		}
	}
}