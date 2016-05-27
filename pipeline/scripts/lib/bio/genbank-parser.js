'use strict'

// Core includes
let assert = require('assert')

// Constants
const kNumLocusFields = 8

/**
 * The locus line is structured with values in specific position ranges; however, it is recommended
 * to use a token based approach for parsing and not rely on actual positions in case this changes
 * in the future.
 *
 * @param {string} line contains the expected locus fields
 * @returns {object} parsed locus values
 */
exports.parseLocus = function(line) {
	assert(!!line, 'invalid argument')

	let parts = line.split(/\s+/),
		hasRightNumFields = parts.length === kNumLocusFields
	if (!hasRightNumFields)
		throw new Error(`LOCUS line does not have ${kNumLocusFields} fields: ${line}`)

	/* eslint-disable no-magic-numbers */
	return {
		name: parts[1],
		bp: Number(parts[2]),
		// (ss-|ds-|ms-)(NA|DNA|RNA|tRNA|rRNA|mRNA|uRNA)
		// ss- = single stranded
		// ds- = double stranded
		// ms- = mixed stranded
		// uRNA = small nuclear RNA
		moleculeType: parts[4],
		topology: parts[5],
		divisionCode: parts[6],
		date: parts[7]
	}
	/* eslint-enable no-magic-numbers */
}
