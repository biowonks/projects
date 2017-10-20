/* eslint-disable no-magic-numbers, no-undefined */
'use strict'

const path = require('path')

const tableFilePath = path.resolve(__dirname, 'test-data/mist3-sig-trans-2017.test.csv')
const SignalTransductionService = require('./SignalTransductionService.js')

describe.only('Signal Transduction Service', function() {
	it('parseTable_', function() {
		const sigTransServ = new SignalTransductionService(tableFilePath)
		let expectedPfql = [
			[
				{
					Npos: [
						{
							resource: 'pfam30',
							feature: 'PAS'
						}
					]
				}
			],
			[
				{
					Npos: [
						{
							resource: 'pfam30',
							feature: 'PAS_2'
						}
					]
				}
			],
			[
				{
					Npos: [
						{
							resource: 'pfam30',
							feature: 'BTAD'
						}
					]
				}
			],
			[
				{
					Npos: [
						{
							resource: 'pfam30',
							feature: 'HisKA'
						}
					]
				}
			],
			[
				{
					Npos: [
						{
							resource: 'pfam30',
							feature: 'HTH_10'
						}
					]
				}
			]
		]
		return sigTransServ.parseTable_().then(function() {
			expect(sigTransServ.sigData.length).eql(5)
			expect(sigTransServ.pfql).eql(expectedPfql)
		})
	})
})
