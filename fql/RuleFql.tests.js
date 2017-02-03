/* eslint-disable no-magic-numbers, no-undefined */
'use strict'

let RuleFql = require('./RuleFql.js')

describe('Class RuleFql ::', function() {
	describe('Initializing the class', () => {
		it('Correct format should load just fine', () => {
			let rule = {
				instructions: [
					[
						'.*@pfam28',
						[1, 1]
					],
					[
						'Cache_1@pfam28',
						[0, 0]
					]
				],
				pos: 1
			}
			let result = {
				instructions: [
					[
						'.*@pfam28',
						[1, 1]
					],
					[
						'Cache_1@pfam28',
						[0, 0]
					]
				],
				matches: [],
				pos: 1,
				numOfIns: 2,
				lowNumMatches: [],
				highNumMatches: [],
				isOk: true
			}
			let ruleFql = new RuleFql(rule)
			expect(ruleFql).eql(result)
		})
		it('Rules with no instructions should also load properly', () => {
			let rule = {
				instructions: [],
				pos: 1
			}
			let result = {
				instructions: [],
				matches: [],
				pos: 1,
				numOfIns: 0,
				lowNumMatches: [],
				highNumMatches: [],
				isOk: true
			}
			let ruleFql = new RuleFql(rule)
			expect(ruleFql).eql(result)
		})
		it('Empty rule should also load ok but pass "undefined" for position', () => {
			let rule = {}
			let result = {
				instructions: [],
				matches: [],
				pos: undefined,
				numOfIns: 0,
				lowNumMatches: [],
				highNumMatches: [],
				isOk: true
			}
			let ruleFql = new RuleFql(rule)
			expect(ruleFql).eql(result)
		})
	})
})
