/* eslint-disable no-magic-numbers, no-undefined */
'use strict'

const path = require('path')

const tableFilePath = path.resolve(__dirname, 'test-data/mist3-sig-trans-2017.test.csv')
const stpUtils = require('./stp-utils.js')

describe('stp-utils', function() {
	it('readPFQLRulesFromCSVFile', function() {
		const expectedPfql = [
			{
				rules: [
					{
						Npos: [
							{
								resource: 'pfam30',
								feature: 'PAS'
							}
						]
					}
				]
			},
			{
				rules: [
					{
						Npos: [
							{
								resource: 'pfam30',
								feature: 'PAS_2'
							}
						]
					}
				]
			},
			{
				rules: [
					{
						Npos: [
							{
								resource: 'pfam30',
								feature: 'BTAD'
							}
						]
					}
				]
			},
			{
				rules: [
					{
						Npos: [
							{
								resource: 'pfam30',
								feature: 'HisKA'
							}
						]
					}
				]
			},
			{
				rules: [
					{
						Npos: [
							{
								resource: 'pfam30',
								feature: 'HTH_10'
							}
						]
					}
				]
			}
		]
		return stpUtils.readPFQLRulesFromCSVFile(tableFilePath).then(function(results) {
			expect(results.length).eql(expectedPfql.length)
			for (let i = 0; i < results.length; i++)
				expect(results[i].rules).eql(expectedPfql[i].rules)
		})
	})
})
