/* eslint-disable no-magic-numbers */

'use strict'

let seqUtil = require('./seq-util')

describe('seq-util', function() {
	describe('parseMaskedRegions', function() {
		let examples = [
			{sequence: '', output: []},
			{sequence: 'ATCGX', output: []},
			{sequence: 'x', output: [[1, 1]]},
			{sequence: 'xA', output: [[1, 1]]},
			{sequence: 'Ax', output: [[2, 2]]},
			{sequence: 'xAx', output: [[1, 1], [3, 3]]},
			{sequence: 'xx', output: [[1, 2]]},
			{sequence: 'ATxxCTxxx', output: [[3, 4], [7, 9]]}
		]

		examples.forEach((example) => {
			it(`${example.sequence} --> ${JSON.stringify(example.output)}`, function() {
				expect(seqUtil.parseMaskedRegions(example.sequence)).deep.equal(example.output)
			})
		})
	})
})
