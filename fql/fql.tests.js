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


*/

let Fql = require('./Fql.js')
let sampleData = require('./test-data/sample-input-fql.json')


describe('Feature Query Language - FQL', function() {
	describe('Sanity checks', function() {
		let fql = null
		beforeEach(function() {
			fql = new Fql()
		})
		it('If no rules are applied, should return only trues', function() {
			let results = fql.applyFilter(sampleData)
			let expected = new Array(sampleData.length).fill(true)
			expect(expected).eql(results)
		})
	})
	describe('Nuts and bolts', () => {
		let fql = null
		beforeEach(function() {
			fql = new Fql()
		})
		it('check behaviour _seqDepotInfoToString', () => {
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
			let expression = fql._seqDepotInfoToString(info)
			expect(expression).equal('TM@dasCache_1@pfam28TM@dasHAMP@pfam28MCPsignal@pfam28')
		})
		it('check behaviour _getConfig')
		it('check behaviour _addResources', () => {
			let rc = 'pfam28'
			fql._addResources(rc)
			fql._addResources(rc)
			rc = 'das'
			fql._addResources(rc)
			fql._addResources(rc)
			expect(fql.resources).eql(['pfam28', 'das'])
		})
		it('check behaviour of _parseRules with missing pos',() => {
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
		it('check behaviour of _parseRules with missing Npos',() => {
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
		it('check behaviour of _parseRules with missing Npos and pos',() => {
			let setOfRules = [{}]
			fql.loadRules(setOfRules)
			expect(fql.parsedRules[0].pos).to.be.null
			expect(fql.parsedRules[0].Npos).to.be.null
		})
		it('check behaviour of _parseRules',() => {
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
				pos: '(CheW@pfam28)(Response_reg@pfam28)',                  Npos: [ 
					[ 
						'(TM@das)',
						''
					]
				]
			}
			let parsed = fql._parseRules(rules)
			expect(parsed).eql(expected)
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
		describe('Missing pos or Npos in arguments should pass pos and Npos null rules', () =>{
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
						"pos": "(CheW@pfam28)(Response_reg@pfam29)",
						"Npos": [
							[
								"(TM@phobius)",
								""
							]
						]
					}
				]
				expect(fql.parsedRules).eql(expectedParsedRule)	
			})			
		})
	})
	describe('Initialize Fql with restrict dataset of Aseqs', function() {
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
	describe('Non positional rules', () => {
		it.only('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single domain from pfam29', function() {
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
				false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
	})
	describe('Single feature request from single resource', function() {
		it('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single domain from pfam29', function() {
			let fql = new Fql()
			let setOfRules = [
				{
					resource: 'pfam28',
					feature: 'CheW'
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
				false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		it('Request protein sequences with 1 match and nothing else to a single domain from pfam29', function() {
			let fql = new Fql()
			let setOfRules = [
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
				false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			expect(fql.match).eql(expected)
		})
		describe('Testing the behaviour of "count"', () => {
			it('Request protein sequences with 2 matches and nothing else to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
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
					false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Request protein sequences with 3 matches and nothing else to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
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
					false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Request protein sequences with 2 or 3 matches and nothing else to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
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
					false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Request protein sequences with 2 or 3 matches at the end of the sequence to a single domain from pfam28', function() {
				let fql = new Fql()
				let setOfRules = [
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
					false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Request protein sequences with 2 TM regions anywhere in the sequence', function() {
				let fql = new Fql()
				let setOfRules = [
					{
						resource: 'das',
						feature: 'TM',
						count: '{2}'
					},
					{
						resource: 'pfam28',
						feature: 'MCPsignal'
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
					false, // **
					false, // **
					true,  // TM | TM | MCPsignal
					true,  // TM | TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
		})
		describe('Invalid inputs', function() {
			let fql = null
			beforeEach(() => {
				fql = new Fql()
			})
			describe('Invalie rules', () => {
				describe('Error handling about missing information', function() {
					it('Missing feature should throw Error', function() {
						let setOfRules = [{
							resource: 'pfam29'
						}]
						expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each rule must explicitly define a feature: \n{"resource":"pfam29"}')
					})
					it('Missing resource should throw Error', function() {
						let setOfRules = [{
							feature: 'CheW'
						}]
						expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each rule must explicitly define a resource: \n{"feature":"CheW"}')
					})
					it('Missing feature and resource should throw Error', function() {
						let setOfRules = [{}]
						expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Each rule must explicitly define a resource and feature: \n{}')
					})
				})
				describe('Error handling for invalid format', function() {
					it('Passing anything but Array as value for feature should throw Error')
				})
			})
		})
	})
	describe('Multiple features request from single resource', function() {
		it('Same position specified in two rules should mean OR')
	})
})
