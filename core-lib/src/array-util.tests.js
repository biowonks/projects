/* eslint-disable no-magic-numbers */
'use strict'

// Local
let arrayUtil = require('./array-util')

describe.only('array-util', function() {
	describe('difference', function() {
		it('two empty arrays returns a new empty array', function() {
			let a = [],
				b = [],
				c = arrayUtil.difference(a, b)
			expect(a).not.equal(c)
			expect(b).not.equal(c)
			expect(c).eql([])
		})

		let examples = [
			{
				a: [1],
				b: [],
				expect: [1]
			},
			{
				a: [],
				b: [1],
				expect: []
			},
			{
				a: [1],
				b: [1],
				expect: []
			},
			{
				a: [1, 2],
				b: [2],
				expect: [1]
			},
			{
				a: [1, 2],
				b: [2, 1],
				expect: []
			},
			{
				a: [1, 2],
				b: ['1', '2', 3],
				expect: [1, 2]
			}
		]

		examples.forEach((example) => {
			it(`${JSON.stringify(example.a)} difference ${JSON.stringify(example.b)} -> ${JSON.stringify(example.expect)}`, function() {
				let result = arrayUtil.difference(example.a, example.b)
				expect(result).eql(example.expect)
			})
		})
	})
})
