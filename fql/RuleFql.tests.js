/* eslint-disable no-magic-numbers, no-undefined */
'use strict'
let expect = require('chai').expect

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
	describe('check behaviour of _commonMatches ::', () => {
		let ruleFql = new RuleFql()
		it('with empty match', () => {
			let matchArchive = []
			let common = []
			expect(ruleFql._findCommonMatches(matchArchive)).eql(common)
		})
		it('with single instruction and single match', () => {
			let matchArchive = [
				{
					matches: [0],
					negative: false
				}
			]
			let common = [0]
			expect(ruleFql._findCommonMatches(matchArchive)).eql(common)
		})
		it('with single instruction', () => {
			let matchArchive = [
				{
					matches: [1, 2, 3, 4, 5],
					negative: false
				}
			]
			let common = [1, 2, 3, 4, 5]
			expect(ruleFql._findCommonMatches(matchArchive)).eql(common)
		})
		it('with multiple instructions', () => {
			let matchArchive = [
				{
					matches: [1, 2, 3, 4, 5, 6],
					negative: false
				},
				{
					matches: [1, 2, 3, 4],
					negative: false
				},
				{
					matches: [1, 2, 3],
					negative: false
				}
			]
			let common = [1, 2, 3]
			expect(ruleFql._findCommonMatches(matchArchive)).eql(common)
		})
		it('with two instructions, not matching from the first element', () => {
			let matchArchive = [
				{
					matches: [1, 2, 3],
					negative: false
				},
				{
					matches: [2, 3],
					negative: false
				}
			]
			let common = [2, 3]
			expect(ruleFql._findCommonMatches(matchArchive)).eql(common)
		})
	})
	describe.skip('RuleFql methods', () => {
		describe('check behaviour of findMatches ::', () => {
			it('')
		})
		describe('check behaviour of checkFirstRule ::', () => {
			it('')
		})
		describe('check behaviour of checkNumMatches ::', () => {
			it('')
		})
	})
})
