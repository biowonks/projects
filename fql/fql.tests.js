/* eslint-disable no-magic-numbers, no-undefined */
'use strict'
/*
AseqIDs sample

_G9KV6UChp5fA--pLFsKtw CheW-Response_reg
s97yGnmuNdJLDTrYUUN8Mg CheW
95iqLX6QoJUvvaHbpnbCfQ CheA, no RR
7hMuWLhwA4TkUJ5akVyt8Q CheA with 2xCheW
pg1GXegkB3AzHlO4KfwrlQ CheA with RR
ImjKGgv7DEZQ4pUVmUz1ow CheW-CheW-CheW
Q8FnjCriQtVZo3BOPDEZ5g RR-NMT_1_2-CheW
1c2aUAJmZbYZAbzGtN9gaw CheW and CheR
LcvBrwNhLzw5U-ks-qIYTw Inverted CheV
aAd5V_e-gatRKwzG5oQbBA TM-Cache1-TM-HAMP-MCPsignal
9fuU3zLn87XIQz-ndLORrA HAMP-MCPsignal
f_3u566PtgMFBqutHB0FSw PAS_9-TM-TM-MCPsignal
y6f7QqYgh9Nz6T15YTWbYA PAS_9-PAS_9-MCPsignal
Gehbo63iKYELF32Gr6Wo2A PAS_9-TM-TM-HAMP-MCPsignal
4TA3sXo7TTSvuCyMPWFQ0Q TM-TM-MCPsignal
9tPW0dc69o71ksFptDhEoQ TM-MCPsignal-Rhodanese
tNRr1mGTQfYEf01hYpdEww TM-TM-TM-TM-MCPsignal
X89W3CfknQQjf9Rpnwl7WA TM-TM-TM-TM-TM-TM-MCPsignal
4bB2LMeohCWN0zoLoRV6Cw TM-Cache_2-Cache_2-TM-HAMP-MCPsignal
jHNUam7VrGX4D5aqqH4Oig TM-CHASE3-TM-HAMP-MCPsignal


*/

let Fql = require('./Fql.js')
let sampleData = require('./test-data/sample-input-fql.json')


describe('Feature Query Language - FQL', function() {
	describe('Sanity checks', function() {
		let fql = null
		beforeEach(function() {
			fql = new Fql()
		})
		it('If no rules are applied, should return only false', function() {
			let results = fql.applyFilter(sampleData)
			let expected = new Array(sampleData.length).fill(false)
			expect(expected).eql(results)
		})
	})
	describe('Nuts and bolts ::', () => {
		let fql = null
		beforeEach(function() {
			fql = new Fql()
		})
		it('check behaviour _seqDepotInfoToArray', () => {
			let setOfRules = [
				{
					pos: [
						{
							resource: 'pfam28',
							feature: 'CheW'
						},
						{
							resource: 'pfam28',
							feature: 'Response_reg'
						}
					],
					Npos: [
						{
							resource: 'das',
							feature: 'TM'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			let info = {
				result: {
					t: {
						das: [
							[8, 27, 18, 5.903, 8.666e-7],
							[288, 315, 302, 5.835, 1.099e-6]
						],
						pfam28: [
							['MCPsignal', 460, 658, '..', 34.5, 12, 203, '..', 435, 669, '..', 143.6, 1.3e-44, 3.8e-42, 0.89],
							['Cache_1', 157, 230, '..', 0.3, 2, 74, '..', 156, 234, '..', 68.3, 2.2e-22, 2.0e-19, 0.95],
							['HAMP', 295, 360, '..', 0, 2, 66, '..', 294, 363, '..', 61.3, 2.9e-19, 4.4e-17, 0.95]
						]
					}
				}
			}
			let expression = fql._seqDepotInfoToArray(info)
			expect(expression).eql(
				[
					'TM@das',
					'Cache_1@pfam28',
					'TM@das',
					'HAMP@pfam28',
					'MCPsignal@pfam28'
				])
		})
		it('check behaviour _getConfig')
		describe.skip('check behaviour of _commonMatches ::', () => {
			it('with empty match', () => {
				let matchArchive = []
				let common = []
				expect(fql._findCommonMatches(matchArchive)).eql(common)
			})
			it('with single instruction and single match', () => {
				let matchArchive = [
					{
						matches: [0],
						negative: false
					}
				]
				let common = [0]
				expect(fql._findCommonMatches(matchArchive)).eql(common)
			})
			it('with single instruction', () => {
				let matchArchive = [
					{
						matches: [1, 2, 3, 4, 5],
						negative: false
					}
				]
				let common = [1, 2, 3, 4, 5]
				expect(fql._findCommonMatches(matchArchive)).eql(common)
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
				expect(fql._findCommonMatches(matchArchive)).eql(common)
			})
			it('with multiple instructions with negative', () => {
				let matchArchive = [
					{
						matches: [],
						negative: true
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
				expect(fql._findCommonMatches(matchArchive)).eql(common)
			})
			it('with two instructions, one negative', () => {
				let matchArchive = [
					{
						matches: [],
						negative: true
					},
					{
						matches: [1, 2, 3],
						negative: false
					}
				]
				let common = [1, 2, 3]
				expect(fql._findCommonMatches(matchArchive)).eql(common)
			})
			it('with two instructions, one negative 2 - Order should not matter', () => {
				let matchArchive = [
					{
						matches: [1, 2, 3],
						negative: false
					},
					{
						matches: [],
						negative: true
					}
				]
				let common = [1, 2, 3]
				expect(fql._findCommonMatches(matchArchive)).eql(common)
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
				expect(fql._findCommonMatches(matchArchive)).eql(common)
			})
			it('with single negative instruction', () => {
				let matchArchive = [
					{
						matches: [],
						negative: true
					}
				]
				let common = []
				expect(fql._findCommonMatches(matchArchive)).eql(common)
			})
		})
		it('check behaviour _addResources', () => {
			let rc = 'pfam28'
			fql._addResources(rc)
			fql._addResources(rc)
			rc = 'das'
			fql._addResources(rc)
			fql._addResources(rc)
			expect(fql.resources).eql(['pfam28', 'das'])
		})
		describe('check behaviour of _parseRules', () => {
			it('with missing pos', () => {
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				expect(fql.parsedRules[0].pos).to.be.null
				expect(fql.parsedRules[0].Npos).to.not.be.null
			})
			it('with missing Npos', () => {
				let setOfRules = [
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				expect(fql.parsedRules[0].pos).to.not.be.null
				expect(fql.parsedRules[0].Npos).to.be.null
			})
			it('with missing Npos and pos', () => {
				let setOfRules = [{}]
				fql.loadRules(setOfRules)
				expect(fql.parsedRules[0].pos).to.be.null
				expect(fql.parsedRules[0].Npos).to.be.null
			})
			it('with pos and Npos', () => {
				let rules =
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							},
							{
								resource: 'pfam28',
								feature: 'Response_reg'
							}
						],
						Npos: [
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				let expected = {
					pos: {
						hardStart: false,
						rules: [
							[
								['CheW@pfam28', [1, NaN]]
							],
							[
								['Response_reg@pfam28', [1, NaN]]
							]
						],
						hardStop: false
					},
					Npos: [
						[
							'TM@das',
							''
						]
					]
				}
				let parsed = fql._parseRules(rules)
				expect(parsed).eql(expected)
			})
			it('with `AND` type of pos rules', () => {
				let rules =
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							},
							[
								{
									resource: 'pfam28',
									feature: 'Response_reg',
									count: '{0}'								},
								{
									resource: 'pfam28',
									feature: '.*',
									count: '{1}'
								}
							]
						],
						Npos: [
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				let expected = {
					pos: {
						hardStart: false,
						rules: [
							[
								['CheW@pfam28', [1, NaN]]
							],
							[
								['Response_reg@pfam28', [0, 0]],
								['.*@pfam28', [1, 1]]
							]
						],
						hardStop: false
					},
					Npos: [
						[
							'TM@das',
							''
						]
					]
				}
				let parsed = fql._parseRules(rules)
				expect(parsed).eql(expected)
			})
			it('with `^` and `$` fql instructions in pos rules', () => {
				let rules =
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: 'CheW'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				let expected = {
					pos: {
						hardStart: true,
						rules: [
							[
								['CheW@pfam28', [1, 1]]
							]
						],
						hardStop: true
					},
					Npos: null
				}
				let parsed = fql._parseRules(rules)
				expect(parsed).eql(expected)
			})
		})
		describe('Checking behaviour of _parseCount', () => {
			it('Too many commas', () => {
				let countInfo = '{1,2,3}'
				expect(fql._parseCount.bind(fql, countInfo)).to.throw('Invalid count value (too many commas): ' + countInfo)
			})
			it('It must be an integer 1', () => {
				let countInfo = '{1,a}'
				expect(fql._parseCount.bind(fql, countInfo)).to.throw('Invalid count value (only integers): ' + countInfo)
			})
			it('It must be an integer 2', () => {
				let countInfo = '{1,2.3}'
				expect(fql._parseCount.bind(fql, countInfo)).to.throw('Invalid count value (only integers): ' + countInfo)
			})
			it('It must work with single number', () => {
				let countInfo = '{7}',
					parsed = fql._parseCount(countInfo)
				expect(parsed).eql([7,7])
			})
			it('It must work with two numbers', () => {
				let countInfo = '{1,7}',
					parsed = fql._parseCount(countInfo)
				expect(parsed).eql([1, 7])
			})
			it('It must work with no number in the first place', () => {
				let countInfo = '{,7}',
					parsed = fql._parseCount(countInfo)
				expect(parsed).eql([0, 7])
			})
			it('It must work with no number in the second place', () => {
				let countInfo = '{1,}',
					parsed = fql._parseCount(countInfo)
				expect(parsed).eql([1, Infinity])
			})
		})
	})
	describe('Loading the rules', () => {
		let fql = null
		beforeEach(function() {
			fql = new Fql()
		})
		it('Rules must load to .rules method, even invalid ones', function() {
			let simpleRule = [
				{
					resource: 'pfam29',
					feature: 'CheW'
				}
			]
			fql.loadRules(simpleRule)
			expect(fql.rules).eql(simpleRule)
		})
		it('All resources used in rules should appear in .resources', function() {
			let setOfRules = [
				{
					pos: [
						{
							resource: 'pfam29',
							feature: 'CheW'
						},
						{
							resource: 'pfam29',
							feature: 'Response_reg'
						},
						{
							resource: 'das',
							feature: 'TM'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			let expected = ['pfam29', 'das']
			expect(fql.resources).eql(expected)
		})
		describe('Missing pos or Npos in arguments should pass pos and Npos null rules', () => {
			it('Missing pos should pass null for rules.pos', () => {
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter
			})
		})
		describe('Checking the integrity of rules - should throw informative Errors', () => {
			it('Missing mandatory field in pos type rule resource should throw Error', () => {
				let setOfRules = [
					{
						pos: [
							{
								resource: 'pfam29',
								feature: 'CheW'
							},
							{
								feature: 'Response_reg'
							},
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				]
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each pos rule must explicitly define a resource')
			})
			it('Missing mandatory field in pos type rule feature should throw Error', () => {
				let setOfRules = [
					{
						pos: [
							{
								resource: 'pfam29',
								feature: 'CheW'
							},
							{
								resource: 'pfam29'
							},
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				]
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each pos rule must explicitly define a feature')
			})
			it('Missing both mandatory fields in pos type rule resource and feature should throw Error', () => {
				let setOfRules = [
					{
						pos: [
							{
								resource: 'pfam29',
								feature: 'CheW'
							},
							{
							},
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				]
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each pos rule must explicitly define a resource and feature')
			})
			it('Missing mandatory field in Npos type rule resource should throw Error', () => {
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam29',
								feature: 'CheW'
							},
							{
								feature: 'Response_reg'
							},
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				]
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each Npos rule must explicitly define a resource')
			})
			it('Missing mandatory field in Npos type rule feature should throw Error', () => {
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam29',
								feature: 'CheW'
							},
							{
								resource: 'pfam29'
							},
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				]
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each Npos rule must explicitly define a feature')
			})
			it('Missing both mandatory fields in Npos type rule resource and feature should throw Error', () => {
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam29',
								feature: 'CheW'
							},
							{
							},
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				]
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each Npos rule must explicitly define a resource and feature')
			})
		})
		describe('Loading rules more than once', () => {
			it('Loading second rule should reset .rules, .resources, .parsedRules', () => {
				let setOfRules1 = [
					{
						pos: [
							{
								resource: 'pfam30',
								feature: 'CheW'
							},
							{
								resource: 'pfam28',
								feature: 'Response_reg'
							}
						],
						Npos: [
							{
								resource: 'das',
								feature: 'TM'
							}
						]
					}
				]
				let setOfRules2 = [
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							},
							{
								resource: 'pfam29',
								feature: 'Response_reg'
							}
						],
						Npos: [
							{
								resource: 'phobius',
								feature: 'TM'
							}
						]
					}
				]
				fql.loadRules(setOfRules1)
				fql.loadRules(setOfRules2)
				expect(fql.rules).eql(setOfRules2)
				expect(fql.resources).eql(['pfam28', 'pfam29', 'phobius'])
				let expectedParsedRule = [
					{
						pos: {
							hardStart: false,
							rules: [
								[
									['CheW@pfam28', [1, NaN]]
								],
								[
									['Response_reg@pfam29', [1, NaN]]
								]
							],
							hardStop: false
						},
						Npos: [
							[
								'TM@phobius',
								''
							]
						]
					}
				]
				expect(fql.parsedRules).eql(expectedParsedRule)
			})
		})
	})
	describe('Initialize Fql with restrict dataset of Aseqs :: ', function() {
		it('List of aseqs, restricted search in list', function() {
			let aseqArray = [
				'yg8A8H8N-4x1Ezf8WW-YbA',
				'naytI0dLM_rK2kaC1m3ZSQ',
				'GS8z3QwN5MzpxU0aTuxuaA',
				'SSYJSGHiGYZVlFVpPJ-sdA',
				'aijSW8Bzi9iHCIkYuqU9UQ',
				'fiUs-3vh34LxGVAdbheipg'
			]
			let fql = new Fql(aseqArray)
			expect(fql.selection).eql(aseqArray)
		})
		it('Nothing will search whole database')
	})
	describe('Non positional rules :: ', () => {
		describe('Single Rule - If broken, fix this first', () => {
			it('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single domain from pfam29', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					true, // CheW | Response_reg
					true, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					true, // Response_reg | NMT1_2 | CheW
					true, // CheW | CheR
					true, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
			it('Filter proteins sequences with 1 match, anywhere in the sequence, to a single domain from pfam29', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{1}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					true, // CheW | Response_reg
					true, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					true, // Response_reg | NMT1_2 | CheW
					true, // CheW | CheR
					true, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
			it('Filter proteins sequences with 1 or 2 matches, anywhere in the sequence, to a single domain from pfam29', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{1,2}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					true, // CheW | Response_reg
					true, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					true, // Response_reg | NMT1_2 | CheW
					true, // CheW | CheR
					true, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
			it('Filter proteins sequences with 2 or 3 matches, anywhere in the sequence, to a single domain from pfam29', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{2,3}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
			it('Filter proteins sequences with 3 or more transmembrane regions, anywhere in the sequence', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'das',
								feature: 'TM',
								count: '{3,}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					true, // TM | TM | TM | TM | MCPsignal
					true, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
			it('Filter proteins sequences without transmembrane regions', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'das',
								feature: 'TM',
								count: '{0}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					true, // CheW | Response_reg
					true, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					true, // Response_reg | NMT1_2 | CheW
					true, // CheW | CheR
					true, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					true, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					true, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
		})
		describe('Multiple Rules - AND mode', () => {
			it('Filter proteins sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{1,}'
							},
							{
								resource: 'pfam28',
								feature: 'HATPase_c',
								count: '{1}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
			it('Filter proteins sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{1,}'
							},
							{
								resource: 'pfam28',
								feature: 'HATPase_c',
								count: '{1}'
							},
							{
								resource: 'pfam28',
								feature: 'Response_reg',
								count: '{0}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
		})
		describe('Multiple Rules - OR mode', () => {
			it('Filter proteins sequences with at least 2 matches to CheW domain in pfam28 OR only 1 match to HATPase_c domain in pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{2,}'
							}
						]
					},
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'HATPase_c',
								count: '{1}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
			it('Filter proteins sequences with at least 2 match to CheW domain in pfam28 OR only 1 match to HATPase_c domain in pfam28 OR only 1 matches to Response_reg in pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{2,}'
							}
						]
					},
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'HATPase_c',
								count: '{1}'
							}
						]
					},
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'Response_reg',
								count: '{1}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					true, // CheW | Response_reg
					false, // CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					true, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					true, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(expected).eql(fql.match)
			})
		})
	})
	describe('Positional rules :: ', function() {
		it('Filter protein sequences starting with 1 match to a CheW domain from Pfam28', function() {
			let fql = new Fql()
			let setOfRules = [
				{
					pos: [
						{
							resource: 'fql',
							feature: '^'
						},
						{
							resource: 'pfam28',
							feature: 'CheW'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			fql.applyFilter(sampleData)
			let expected = [
				true, // CheW | CheW
				true, // CheW | Response_reg
				true, // CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				true, // CheW | CheW | CheW
				false, // Response_reg | NMT1_2 | CheW
				true, // CheW | CheR
				false, // Response_reg | CheW
				false, // TM | Cache_1 | TM | HAMP | MCPsignal
				false, // HAMP | MCPsignal
				false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				false, // **
				false, // **
				false, // TM | TM | MCPsignal
				false, // TM | MCPsignal | Rhodanese
				false, // TM | TM | TM | TM | MCPsignal
				false, // TM | TM | TM | TM | TM | TM | MCPsignal
				false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		it('Filter protein sequences starting with 2 CheW domains from Pfam28', function() {
			let fql = new Fql()
			let setOfRules = [
				{
					pos: [
						{
							resource: 'fql',
							feature: '^'
						},
						{
							resource: 'pfam28',
							feature: 'CheW',
							count: '{2}'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			fql.applyFilter(sampleData)
			let expected = [
				true, // CheW | CheW
				false, // CheW | Response_reg
				false, // CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				false, // CheW | CheW | CheW
				false, // Response_reg | NMT1_2 | CheW
				false, // CheW | CheR
				false, // Response_reg | CheW
				false, // TM | Cache_1 | TM | HAMP | MCPsignal
				false, // HAMP | MCPsignal
				false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				false, // **
				false, // **
				false, // TM | TM | MCPsignal
				false, // TM | MCPsignal | Rhodanese
				false, // TM | TM | TM | TM | MCPsignal
				false, // TM | TM | TM | TM | TM | TM | MCPsignal
				false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		it('Filter protein sequences starting with 2 or more CheW domains from Pfam28', function() {
			let fql = new Fql()
			let setOfRules = [
				{
					pos: [
						{
							resource: 'fql',
							feature: '^'
						},
						{
							resource: 'pfam28',
							feature: 'CheW',
							count: '{2,}'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			fql.applyFilter(sampleData)
			let expected = [
				true, // CheW | CheW
				false, // CheW | Response_reg
				false, // CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				true, // CheW | CheW | CheW
				false, // Response_reg | NMT1_2 | CheW
				false, // CheW | CheR
				false, // Response_reg | CheW
				false, // TM | Cache_1 | TM | HAMP | MCPsignal
				false, // HAMP | MCPsignal
				false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				false, // **
				false, // **
				false, // TM | TM | MCPsignal
				false, // TM | MCPsignal | Rhodanese
				false, // TM | TM | TM | TM | MCPsignal
				false, // TM | TM | TM | TM | TM | TM | MCPsignal
				false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		it('Filter protein sequences starting with 1 TM followed by 1 Cache_2 domain from Pfam28', function() {
			let fql = new Fql()
			let setOfRules = [
				{
					pos: [
						{
							resource: 'fql',
							feature: '^'
						},
						{
							resource: 'das',
							feature: 'TM',
							count: '{1}'
						},
						{
							resource: 'pfam28',
							feature: 'Cache_2',
							count: '{1}'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			fql.applyFilter(sampleData)
			let expected = [
				false, // CheW | CheW
				false, // CheW | Response_reg
				false, // CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				false, // CheW | CheW | CheW
				false, // Response_reg | NMT1_2 | CheW
				false, // CheW | CheR
				false, // Response_reg | CheW
				false, // TM | Cache_1 | TM | HAMP | MCPsignal
				false, // HAMP | MCPsignal
				false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				false, // **
				false, // **
				false, // TM | TM | MCPsignal
				false, // TM | MCPsignal | Rhodanese
				false, // TM | TM | TM | TM | MCPsignal
				false, // TM | TM | TM | TM | TM | TM | MCPsignal
				false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				true, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		it('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single domain from pfam28', function() {
			let fql = new Fql()
			let setOfRules = [
				{
					pos: [
						{
							resource: 'pfam28',
							feature: 'CheW'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			fql.applyFilter(sampleData)
			let expected = [
				true, // CheW | CheW
				true, // CheW | Response_reg
				true, // CheW
				true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				true, // CheW | CheW | CheW
				true, // Response_reg | NMT1_2 | CheW
				true, // CheW | CheR
				true, // Response_reg | CheW
				false, // TM | Cache_1 | TM | HAMP | MCPsignal
				false, // HAMP | MCPsignal
				false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				false, // **
				false, // **
				false, // TM | TM | MCPsignal
				false, // TM | MCPsignal | Rhodanese
				false, // TM | TM | TM | TM | MCPsignal
				false, // TM | TM | TM | TM | TM | TM | MCPsignal
				false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		it('Non-positional and positional rules can have the same output', function() {
			let fqlP = new Fql()
			let fqlNP = new Fql()
			let setOfRulesPos = [
				{
					pos: [
						{
							resource: 'pfam28',
							feature: 'CheW'
						}
					]
				}
			]
			let setOfRulesNonPos = [
				{
					Npos: [
						{
							resource: 'pfam28',
							feature: 'CheW'
						}
					]
				}
			]
			fqlP.loadRules(setOfRulesPos)
			fqlP.applyFilter(sampleData)
			fqlNP.loadRules(setOfRulesNonPos)
			fqlNP.applyFilter(sampleData)
			expect(fqlP.match).eql(fqlNP.match)
		})
		it('Filter protein sequences with 1 match to a CheW domain from Pfam28', function() {
			let fql = new Fql()
			let setOfRules = [
				{
					pos: [
						{
							resource: 'fql',
							feature: '^'
						},
						{
							resource: 'pfam28',
							feature: 'CheW'
						},
						{
							resource: 'fql',
							feature: '$'
						}
					]
				}
			]
			fql.loadRules(setOfRules)
			fql.applyFilter(sampleData)
			let expected = [
				false, // CheW | CheW
				false, // CheW | Response_reg
				true, // CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				false, // CheW | CheW | CheW
				false, // Response_reg | NMT1_2 | CheW
				false, // CheW | CheR
				false, // Response_reg | CheW
				false, // TM | Cache_1 | TM | HAMP | MCPsignal
				false, // HAMP | MCPsignal
				false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				false, // **
				false, // **
				false, // TM | TM | MCPsignal
				false, // TM | MCPsignal | Rhodanese
				false, // TM | TM | TM | TM | MCPsignal
				false, // TM | TM | TM | TM | TM | TM | MCPsignal
				false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		describe('Testing the behaviour of "count" for positional rules :: ', () => {
			it('Request protein sequences with 2 matches and nothing else to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{2}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Request protein sequences with 3 matches and nothing else to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{3}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter protein sequences with 2 or 3 matches and nothing else to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{2,3}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Request protein sequences with 2 or 3 matches at the end of the sequence to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW',
								count: '{2,3}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					true, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					true, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Request protein sequences with 2 TM regions anywhere in the sequence with MCPsignal at the end', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'das',
								feature: 'TM',
								count: '{2}'
							}
						],
						pos: [
							{
								resource: 'pfam28',
								feature: 'MCPsignal'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					true, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					true, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					true, // **
					true,  // TM | TM | MCPsignal
					false,  // TM | TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					true // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
		})
		describe('Testing the behaviour of wildcard for positional rules', () => {
			it('Filter protein sequences with 1 or more domains between 2 TM regions in the begigging of the sequence and with MCPsignal at the end', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{1,}'
							},
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{1,}'
							},
							{
								resource: 'pfam28',
								feature: 'MCPsignal',
								count: '{1}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					true, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false,  // TM | TM | MCPsignal
					false,  // TM | TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					true // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter protein sequences starting with no Cache_1 between two TM and ending a MCPsignal', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							[
								{
									resource: 'pfam28',
									feature: 'Cache_1',
									count: '{0}'
								},
								{
									resource: 'pfam28',
									feature: '.*',
									count: '{1,}'
								}
							],
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{1,}'
							},
							{
								resource: 'pfam28',
								feature: 'MCPsignal',
								count: '{1}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false,  // TM | TM | MCPsignal
					false,  // TM | TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					true // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter protein sequences starting with TM followed by any two domains from pfam28 but no Cache_1 followed by another TM and ending a MCPsignal', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							[
								{
									resource: 'pfam28',
									feature: '.*',
									count: '{2}'
								},
								{
									resource: 'pfam28',
									feature: 'Cache_1',
									count: '{0}'
								}
							],
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{1,}'
							},
							{
								resource: 'pfam28',
								feature: 'MCPsignal',
								count: '{1}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false,  // TM | TM | MCPsignal
					false,  // TM | TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter protein sequences starting with TM followed by any two domains from pfam28 but Cache_1 not in the first of the two followed by another TM and ending a MCPsignal', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							[
								{
									resource: 'pfam28',
									feature: 'Cache_1',
									count: '{0}'
								},
								{
									resource: 'pfam28',
									feature: '.*',
									count: '{1}'
								}
							],
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{1}'
							},
							{
								resource: 'das',
								feature: 'TM',
								count: '{1}'
							},
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{1,}'
							},
							{
								resource: 'pfam28',
								feature: 'MCPsignal',
								count: '{1}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false,  // TM | TM | MCPsignal
					false,  // TM | TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter sequences that start with TM and end with MCPsignal.', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'das',
								feature: 'TM'
							},
							{
								resource: '.*',
								feature: '.*',
								count: '{1,}'
							},
							{
								resource: 'pfam28',
								feature: 'MCPsignal',
								count: '{1}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					true, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					true,  // TM | TM | MCPsignal
					false,  // TM | TM | MCPsignal | Rhodanese
					true, // TM | TM | TM | TM | MCPsignal
					true, // TM | TM | TM | TM | TM | TM | MCPsignal
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					true // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter protein sequences that starts with at least 3 domains of the PAS family using wildcards "PAS.*"', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: 'PAS.*',
								count: '{3}'
							}
						]
					}
				]
				fql.loadRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					false, // CheW | CheW
					false, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					false, // CheW | CheR
					false, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					false, // HAMP | MCPsignal
					true, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					true, // **
					true, // **
					false,  // TM | TM | MCPsignal
					false,  // TM | TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
		})
	})
	describe('Multiple features request from single resource', function() {
		it('Same position specified in two rules should mean OR')
	})
})
