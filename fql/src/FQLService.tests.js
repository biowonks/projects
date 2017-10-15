/* eslint-disable no-magic-numbers, no-undefined */
'use strict'
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

let expect = require('chai').expect

let FQLService = require('./FQLService.js')
let sampleData = require('../test-data/FQL-sample-input.json')

describe('Feature Query Language - FQL', function() {
	describe('Sanity checks', function() {
		it('If no rules are passed, it should fail', function() {
			let	fqlService = new FQLService()
			expect(fqlService.initRules.bind(fqlService)).to.throw('No rules have been passed in the constructor')
		})
	})
	describe('Nuts and bolts ::', function() {
		it('check behaviour _addResources with two ruleIndex', function() {
			let	fqlService = new FQLService([[], []])
			fqlService.initRules()
			let rc = 'pfam28'
			fqlService._addResources(rc, 0)
			fqlService._addResources(rc, 1)
			expect(fqlService.resources).eql([['pfam28'], ['pfam28']])
		})
		it('check behaviour _addResources with single ruleIndex and adding same resource twice', function() {
			let	fqlService = new FQLService([[]])
			fqlService.initRules()
			let rc = 'pfam28'
			fqlService._addResources(rc, 0)
			fqlService._addResources(rc, 0)
			rc = 'das'
			fqlService._addResources(rc, 0)
			fqlService._addResources(rc, 0)
			expect(fqlService.resources).eql([['pfam28', 'das']])
		})
		it('check behaviour _addResources with two ruleIndex and adding same resource twice', function() {
			let	fqlService = new FQLService([[], []])
			fqlService.initRules()
			let rc = 'pfam28'
			fqlService._addResources(rc, 0)
			fqlService._addResources(rc, 1)
			fqlService._addResources(rc, 0)
			fqlService._addResources(rc, 1)
			rc = 'das'
			fqlService._addResources(rc, 0)
			fqlService._addResources(rc, 1)
			fqlService._addResources(rc, 0)
			fqlService._addResources(rc, 1)
			expect(fqlService.resources).eql([['pfam28', 'das'], ['pfam28', 'das']])
		})
		it('check behaviour _processFeaturesInfo', function() {
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
			let	fqlService = new FQLService([setOfRules])
			fqlService.initRules()
			let info = {
				t: {
					das: [
						["TM", 8, 27, 18, 5.903, 8.666e-7],
						["TM", 288, 315, 302, 5.835, 1.099e-6]
					],
					pfam28: [
						['MCPsignal', 460, 658, '..', 34.5, 12, 203, '..', 435, 669, '..', 143.6, 1.3e-44, 3.8e-42, 0.89],
						['Cache_1', 157, 230, '..', 0.3, 2, 74, '..', 156, 234, '..', 68.3, 2.2e-22, 2.0e-19, 0.95],
						['HAMP', 295, 360, '..', 0, 2, 66, '..', 294, 363, '..', 61.3, 2.9e-19, 4.4e-17, 0.95]
					]
				}
			}
			let expression = fqlService._processFeaturesInfo(info, 0)
			expect(expression).eql(
				[
					'TM@das',
					'Cache_1@pfam28',
					'TM@das',
					'HAMP@pfam28',
					'MCPsignal@pfam28'
				]
			)
		})
		it('check behaviour _processFeaturesInfo with different resources', function() {
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
						},
						{
							resource: 'smart',
							feature: 'SM1049'
						}
					]
				}
			]
			let	fqlService = new FQLService([setOfRules])
			fqlService.initRules()
			let info = {
				t: {
					das: [
						["TM", 8, 27, 18, 5.903, 8.666e-7],
						["TM", 288, 315, 302, 5.835, 1.099e-6]
					],
					pfam28: [
						['MCPsignal', 460, 658, '..', 34.5, 12, 203, '..', 435, 669, '..', 143.6, 1.3e-44, 3.8e-42, 0.89],
						['Cache_1', 157, 230, '..', 0.3, 2, 74, '..', 156, 234, '..', 68.3, 2.2e-22, 2.0e-19, 0.95],
						['HAMP', 295, 360, '..', 0, 2, 66, '..', 294, 363, '..', 61.3, 2.9e-19, 4.4e-17, 0.95]
					]
				}
			}
			let expression = fqlService._processFeaturesInfo(info, 0)
			expect(expression).eql(
				[
					'TM@das',
					'Cache_1@pfam28',
					'TM@das',
					'HAMP@pfam28',
					'MCPsignal@pfam28'
				]
			)
		})
		describe('check behaviour of _parseRules', function() {
			it('with missing pos', function() {
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
				let	fqlService = new FQLService([setOfRules])
				fqlService.initRules()
				expect(fqlService.parsedSetsOfRules[0][0].pos).to.be.null
				expect(fqlService.parsedSetsOfRules[0][0].Npos).to.not.be.null
			})
			it('with missing Npos', function() {
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
				let	fqlService = new FQLService([setOfRules])
				fqlService.initRules()
				expect(fqlService.parsedSetsOfRules[0][0].pos).to.not.be.null
				expect(fqlService.parsedSetsOfRules[0][0].Npos).to.be.null
			})
			it('with missing Npos and pos', function() {
				let setOfRules = [{}]
				let	fqlService = new FQLService([setOfRules])
				fqlService.initRules()
				expect(fqlService.parsedSetsOfRules[0][0].pos).to.be.null
				expect(fqlService.parsedSetsOfRules[0][0].Npos).to.be.null
			})
			it('with pos and Npos', function() {
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
				let	fqlService = new FQLService([[rules]])
				fqlService.initRules()
				let parsed = fqlService._parseRules(rules, 0)
				expect(parsed).eql(expected)
			})
			it('with `AND` type of pos rules', function() {
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
									count: '{0}'
								},
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
				let	fqlService = new FQLService([[rules]])
				fqlService.initRules()
				let parsed = fqlService._parseRules(rules, 0)
				expect(parsed).eql(expected)
			})
			it('with `^` and `$` fql instructions in pos rules', function() {
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
				let	fqlService = new FQLService([[rules]])
				fqlService.initRules()
				let parsed = fqlService._parseRules(rules, 0)
				expect(parsed).eql(expected)
			})
		})
		describe('Checking behaviour of _parseCount', function() {
			it('Too many commas', function() {
				let countInfo = '{1,2,3}'
				let fqlService = new FQLService([[]])
				fqlService.initRules()
				expect(fqlService._parseCount.bind(fqlService, countInfo)).to.throw('Invalid count value (too many commas): ' + countInfo)
			})
			it('It must be an integer 1', function() {
				let countInfo = '{1,a}'
				let fqlService = new FQLService([[]])
				fqlService.initRules()
				expect(fqlService._parseCount.bind(fqlService, countInfo)).to.throw('Invalid count value (only integers): ' + countInfo)
			})
			it('It must be an integer 2', function() {
				let countInfo = '{1,2.3}'
				let fqlService = new FQLService([[]])
				fqlService.initRules()
				expect(fqlService._parseCount.bind(fqlService, countInfo)).to.throw('Invalid count value (only integers): ' + countInfo)
			})
			it('It must work with single number', function() {
				let fqlService = new FQLService([[]])
				fqlService.initRules()
				let countInfo = '{7}',
					parsed = fqlService._parseCount(countInfo)
				expect(parsed).eql([7, 7])
			})
			it('It must work with two numbers', function() {
				let fqlService = new FQLService([[]])
				fqlService.initRules()
				let countInfo = '{1,7}',
					parsed = fqlService._parseCount(countInfo)
				expect(parsed).eql([1, 7])
			})
			it('It must work with no number in the first place', function() {
				let fqlService = new FQLService([[]])
				fqlService.initRules()
				let countInfo = '{,7}',
					parsed = fqlService._parseCount(countInfo)
				expect(parsed).eql([0, 7])
			})
			it('It must work with no number in the second place', function() {
				let fqlService = new FQLService([[]])
				fqlService.initRules()
				let countInfo = '{1,}',
					parsed = fqlService._parseCount(countInfo)
				expect(parsed).eql([1, Infinity])
			})
		})
	})
	describe('Loading single rules', function() {
		it('Rules must load to .rules method, even invalid ones', function() {
			let simpleRule = [
				{
					resource: 'pfam29',
					feature: 'CheW'
				}
			]
			let	fqlService = new FQLService([simpleRule])
			expect(fqlService.setsOfRules).eql([simpleRule])
		})
		it('After initRules, all resources used in rules should appear in .resources', function() {
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
			let	fqlService = new FQLService([setOfRules])
			fqlService.initRules(setOfRules)
			let expected = ['pfam29', 'das']
			expect(fqlService.resources).eql([expected])
		})
		describe('Missing pos or Npos in arguments should pass pos and Npos null rules', function() {
			it('Missing pos should pass undefined for rules.pos', function() {
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
				let	fqlService = new FQLService([setOfRules])
				fqlService.initRules()
				expect(fqlService.setsOfRules[0].pos).to.be.undefined
			})
		})
		describe('Checking the integrity of rules - should throw informative Errors', function() {
			it('Missing mandatory field in pos type rule resource should throw Error', function() {
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
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Each pos rule must explicitly define a resource: \n{"feature":"Response_reg"}')
			})
			it('Missing mandatory field in pos type rule feature should throw Error', function() {
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
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Each pos rule must explicitly define a feature: \n{"resource":"pfam29"}')
			})
			it('Missing both mandatory fields in pos type rule resource and feature should throw Error', function() {
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
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Each pos rule must explicitly define a resource and feature: \n{}')
			})
			it('Missing mandatory field in Npos type rule resource should throw Error', function() {
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
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Each Npos rule must explicitly define a resource: \n{"feature":"Response_reg"}')
			})
			it('Missing mandatory field in Npos type rule feature should throw Error', function() {
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
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Each Npos rule must explicitly define a feature: \n{"resource":"pfam29"}')
			})
			it('Missing both mandatory fields in Npos type rule resource and feature should throw Error', function() {
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
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Each Npos rule must explicitly define a resource and feature: \n{}')
			})
			it('Wrong wild card "*" instead of ".*" in positional rules', function() {
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: '*',
								count: '{2}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Wrong wild card. Change "*" to ".*" in:\n{"resource":"pfam28","feature":"*","count":"{2}"}')
			})
			it('Wrong wild card "*" instead of ".*" in non-positional rules', function() {
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: '*',
								count: '{2}'
							}
						]
					}
				]
				let fqlService = new FQLService([setOfRules])
				expect(fqlService.initRules.bind(fqlService)).to.throw('Wrong wild card. Change "*" to ".*" in:\n{"resource":"pfam28","feature":"*","count":"{2}"}')
			})
		})
	})
	describe('Non positional rules :: ', function() {
		describe('Single Rule - If broken, fix this first', function() {
			it('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single CheW domain from pfam29', function() {
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
				let expected = [
					[0], // CheW | CheW
					[0], // CheW | Response_reg
					[0], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[0], // Response_reg | NMT1_2 | CheW
					[0], // CheW | CheR
					[0], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins sequences with 1 or 2 matches, anywhere in the sequence, to a single CheW domain from pfam29', function() {
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
				let expected = [
					[0], // CheW | CheW
					[0], // CheW | Response_reg
					[0], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[0], // Response_reg | NMT1_2 | CheW
					[0], // CheW | CheR
					[0], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins sequences with 2 or 3 matches, anywhere in the sequence, to a single CheW domain from pfam29', function() {
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
				let expected = [
					[0], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins sequences with 3 or more transmembrane regions, anywhere in the sequence', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[0], // TM | TM | TM | TM | MCPsignal
					[0], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins sequences without transmembrane regions', function() {
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
				let expected = [
					[0], // CheW | CheW
					[0], // CheW | Response_reg
					[0], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[0], // Response_reg | NMT1_2 | CheW
					[0], // CheW | CheR
					[0], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[0], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[0], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins with 1 domain from pfam28', function() {
				let setOfRules = [
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{1}'
							}
						]
					}
				]
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[0], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[0], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[0], // TM | TM | TM | TM | MCPsignal
					[0], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
		describe('Multiple Rules - AND mode', function() {
			it('Filter proteins sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
		describe('Multiple Rules - OR mode', function() {
			it('Filter proteins sequences with at least 2 matches to CheW domain in pfam28 OR only 1 match to HATPase_c domain in pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins sequences with at least 2 match to CheW domain in pfam28 OR only 1 match to HATPase_c domain in pfam28 OR only 1 matches to Response_reg in pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[0], // CheW | Response_reg
					[], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[0], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[0], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
	})
	describe('Positional rules :: ', function() {
		describe('Simple matches :: ', function() {
			it('Filter protein sequences starting with 1 match to a CheW domain from Pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[0], // CheW | Response_reg
					[0], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[0], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences starting with 2 CheW domains from Pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences starting with 2 or more CheW domains from Pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences starting with 1 TM followed by 1 Cache_2 domain from Pfam28', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences starting with 1 TM follow by any 2 feature and another TM', function() {
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
								resource: '.*',
								feature: '.*',
								count: '{2}'
							},
							{
								resource: 'das',
								feature: 'TM',
								count: '{1,}'
							}
						],
						Npos: [
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{0,}'
							}
						]
					}
				]
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[0], // TM | TM | TM | TM | MCPsignal
					[0], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])
				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single domain from pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[0], // CheW | Response_reg
					[0], // CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[0], // Response_reg | NMT1_2 | CheW
					[0], // CheW | CheR
					[0], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Non-positional and positional rules can have the same output', function() {
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
				let setsOfRules = [setOfRulesPos, setOfRulesNonPos]
				let expected = [
					[0, 1], // CheW | CheW
					[0, 1], // CheW | Response_reg
					[0, 1], // CheW
					[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0, 1], // CheW | CheW | CheW
					[0, 1], // Response_reg | NMT1_2 | CheW
					[0, 1], // CheW | CheR
					[0, 1], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService(setsOfRules)

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Don\'t know why doesn\'t work - Two different rules should not give the same output', function() {
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
								feature: 'MCPSignal'
							}
						]
					}
				]
				let fqlServiceP = new FQLService([setOfRulesPos]),
					fqlServiceNP = new FQLService([setOfRulesNonPos])


				fqlServiceP.initRules()
				let resultsP = []
				sampleData.slice(0, 1).forEach(function(item) {
					resultsP.push(fqlServiceP.findMatches(item))
				})
				console.log(resultsP)
				fqlServiceNP.initRules()

				let resultsNP = []
				console.log(sampleData.slice(0, 1))
				sampleData.slice(0, 1).forEach(function(item) {
					resultsNP.push(fqlServiceNP.findMatches(item))
				})

				console.log(resultsP)
				console.log(resultsNP)
				expect(resultsP).not.eql(resultsNP)
			})
			it('Filter protein sequences with 1 match to a CheW domain from Pfam28', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[0], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter sequences with starts with TM-Cache_1 and end in MCPsignal', function() {
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
								feature: 'Cache_1',
								count: '{1}'
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[0], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter sequences with starts with TM-Cache_1 followed by anything BUT another Cache_1 and end in MCPsignal', function() {
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
								feature: 'Cache_1',
								count: '{1}'
							},
							[
								{
									resource: '.*',
									feature: '.*',
									count: '{1,}'
								},
								{
									resource: 'pfam28',
									feature: 'Cache_1',
									count: '{0}'
								}
							],
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[0], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter sequences with starts with TM-Cache_2 and end in MCPsignal', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[0] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
		describe('Testing the behaviour of "count" for positional rules :: ', function() {
			it('Request protein sequences with 2 matches and nothing else to a single domain from pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Request protein sequences with 3 matches and nothing else to a single domain from pfam28', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences with 2 or 3 matches and nothing else to a single domain from pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Request protein sequences with 2 or 3 matches at the end of the sequence to a single domain from pfam28', function() {
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
				let expected = [
					[0], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[0], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Request protein sequences with 2 TM regions anywhere in the sequence with MCPsignal at the end', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[0], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[0], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[0], // **
					[0],  // TM | TM | MCPsignal
					[],  // TM | TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[0] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
		describe('Testing the behaviour of wildcard for positional rules', function() {
			it('Filter protein sequences with any 2 pfam28 domains', function() {
				let setOfRules = [
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{2}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
				let expected = [
					[0], // CheW | CheW
					[0], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[0], // CheW | CheR
					[0], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[0], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[],  // TM | TM | MCPsignal
					[0],  // TM | TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences with 1 or more domains between 2 TM regions in the beginning of the sequence and with MCPsignal at the end', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[0], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[],  // TM | TM | MCPsignal
					[],  // TM | TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[0] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences starting with no Cache_1 between two TM and ending a MCPsignal', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[],  // TM | TM | MCPsignal
					[],  // TM | TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[0] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences starting with TM followed by any two domains from pfam28 but no Cache_1 followed by another TM and ending a MCPsignal', function() {
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
									count: '{1}'
								},
								{
									resource: 'pfam28',
									feature: 'Cache_1',
									count: '{0}'
								}
							],
							[
								{
									resource: 'pfam28',
									feature: '.*',
									count: '{1}'
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[],  // TM | TM | MCPsignal
					[],  // TM | TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences starting with TM followed by any two domains from pfam28 but Cache_1 not in the first of the two followed by another TM and ending a MCPsignal', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[],  // TM | TM | MCPsignal
					[],  // TM | TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter sequences that start with TM and end with MCPsignal.', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[0], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[0],  // TM | TM | MCPsignal
					[],  // TM | TM | MCPsignal | Rhodanese
					[0], // TM | TM | TM | TM | MCPsignal
					[0], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[0] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
			it('Filter protein sequences that starts with at least 3 domains of the PAS family using wildcards "PAS.*"', function() {
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[0], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[0], // **
					[0], // **
					[],  // TM | TM | MCPsignal
					[],  // TM | TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
	})
	describe('Complex queries', function() {
		describe('Same position specified in two rules should mean OR', function() {
			it('Filter sequences with starts with TM-Cache_1 or TM-Cache_2 and end in MCPsignal', function() {
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
					},
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
								feature: 'Cache_1',
								count: '{1}'
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
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[0], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[0],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[0] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
		describe('Combining Npos and pos rules', function() {
			it('Filter protein sequences that starts with TM-Cache1 and ends with MCPsignal but does not have Cache_2 anywhere', function() {
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
								feature: 'Cache_1',
								count: '{1}'
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
						],
						Npos: [
							{
								resource: 'pfam28',
								feature: 'Cache_2',
								count: '{0}'
							}
						]
					}
				]
				let expected = [
					[], // CheW | CheW
					[], // CheW | Response_reg
					[], // CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					[], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					[], // CheW | CheW | CheW
					[], // Response_reg | NMT1_2 | CheW
					[], // CheW | CheR
					[], // Response_reg | CheW
					[0], // TM | Cache_1 | TM | HAMP | MCPsignal
					[], // HAMP | MCPsignal
					[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					[], // **
					[], // **
					[], // TM | TM | MCPsignal
					[], // TM | MCPsignal | Rhodanese
					[], // TM | TM | TM | TM | MCPsignal
					[], // TM | TM | TM | TM | TM | TM | MCPsignal
					[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					[0], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				let fqlService = new FQLService([setOfRules])

				fqlService.initRules()

				let results = []
				sampleData.forEach(function(item) {
					results.push(fqlService.findMatches(item).FQLMatches)
				})
				expect(results).eql(expected)
			})
		})
	})
	describe('Sets of rules should also work', function() {
		it('two equal rules must match same entries', function() {
			let setsOfRules = [
				[
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				],
				[
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				]
			]
			let expected = [
				[0, 1], // CheW | CheW
				[0, 1], // CheW | Response_reg
				[0, 1], // CheW
				[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				[0, 1], // CheW | CheW | CheW
				[0, 1], // Response_reg | NMT1_2 | CheW
				[0, 1], // CheW | CheR
				[0, 1], // Response_reg | CheW
				[], // TM | Cache_1 | TM | HAMP | MCPsignal
				[], // HAMP | MCPsignal
				[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				[], // **
				[], // **
				[], // TM | TM | MCPsignal
				[], // TM | MCPsignal | Rhodanese
				[], // TM | TM | TM | TM | MCPsignal
				[], // TM | TM | TM | TM | TM | TM | MCPsignal
				[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			let fqlService = new FQLService(setsOfRules)
			let results = []
			fqlService.initRules()
			let promises = []
			sampleData.forEach(function(item) {
				results.push(fqlService.findMatches(item).FQLMatches)
			})
			expect(results).eql(expected)
		})
		it('Two different rules matching different entries', function() {
			let setsOfRules = [
				[
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				],
				[
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
			]
			let expected = [
				[0], // CheW | CheW
				[0], // CheW | Response_reg
				[0], // CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				[0], // CheW | CheW | CheW
				[0], // Response_reg | NMT1_2 | CheW
				[0], // CheW | CheR
				[0], // Response_reg | CheW
				[1], // TM | Cache_1 | TM | HAMP | MCPsignal
				[], // HAMP | MCPsignal
				[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				[], // **
				[], // **
				[], // TM | TM | MCPsignal
				[], // TM | MCPsignal | Rhodanese
				[], // TM | TM | TM | TM | MCPsignal
				[], // TM | TM | TM | TM | TM | TM | MCPsignal
				[1],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				[1], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				[1], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				[1], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				[1] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			let fqlService = new FQLService(setsOfRules)

			let results = []
			fqlService.initRules()
			let promises = []
			sampleData.forEach(function(item) {
				results.push(fqlService.findMatches(item).FQLMatches)
			})
			expect(results).eql(expected)
		})
		it('Overlapping rules matching different entries', function() {
			let setsOfRules = [
				[
					{
						pos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				],
				[
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
				],
				[
					{
						pos: [
							{
								resource: 'fql',
								feature: '^'
							},
							{
								resource: 'pfam28',
								feature: '.*',
								count: '{2}'
							},
							{
								resource: 'fql',
								feature: '$'
							}
						]
					}
				]
			]
			let expected = [
				[0, 2], // CheW | CheW
				[0, 2], // CheW | Response_reg
				[0], // CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				[0], // CheW | CheW | CheW
				[0], // Response_reg | NMT1_2 | CheW
				[0, 2], // CheW | CheR
				[0, 2], // Response_reg | CheW
				[1], // TM | Cache_1 | TM | HAMP | MCPsignal
				[2], // HAMP | MCPsignal
				[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				[], // **
				[], // **
				[], // TM | TM | MCPsignal
				[2], // TM | MCPsignal | Rhodanese
				[], // TM | TM | TM | TM | MCPsignal
				[], // TM | TM | TM | TM | TM | TM | MCPsignal
				[1],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				[1], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				[1], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				[1], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				[1] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			let fqlService = new FQLService(setsOfRules)

			let results = []
			fqlService.initRules()
			let promises = []
			sampleData.forEach(function(item) {
				results.push(fqlService.findMatches(item).FQLMatches)
			})
			expect(results).eql(expected)
		})
	})
	describe('Using multiple resources', function() {
		it(':: testing pfam28 and smart in the same set', function() {
			let setsOfRules = [
				[
					{
						Npos: [
							{
								resource: 'smart',
								feature: 'SM00260'
							}
						]
					},
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				]
			]
			let expected = [
				[0], // CheW | CheW
				[0], // CheW | Response_reg
				[0], // CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				[0], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				[0], // CheW | CheW | CheW
				[0], // Response_reg | NMT1_2 | CheW
				[0], // CheW | CheR
				[0], // Response_reg | CheW
				[], // TM | Cache_1 | TM | HAMP | MCPsignal
				[], // HAMP | MCPsignal
				[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				[], // **
				[], // **
				[], // TM | TM | MCPsignal
				[], // TM | MCPsignal | Rhodanese
				[], // TM | TM | TM | TM | MCPsignal
				[], // TM | TM | TM | TM | TM | TM | MCPsignal
				[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			let fqlService = new FQLService(setsOfRules)

			let results = []
			fqlService.initRules()
			let promises = []
			sampleData.forEach(function(item) {
				results.push(fqlService.findMatches(item).FQLMatches)
			})
			expect(results).eql(expected)
		})
		it(':: testing pfam28 and smart in different sets', function() {
			let setsOfRules = [
				[
					{
						Npos: [
							{
								resource: 'smart',
								feature: 'SM00260'
							}
						]
					}
				],
				[
					{
						Npos: [
							{
								resource: 'pfam28',
								feature: 'CheW'
							}
						]
					}
				]
			]
			let expected = [
				[0, 1], // CheW | CheW
				[0, 1], // CheW | Response_reg
				[0, 1], // CheW
				[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
				[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
				[0, 1], // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
				[0, 1], // CheW | CheW | CheW
				[0, 1], // Response_reg | NMT1_2 | CheW
				[0, 1], // CheW | CheR
				[0, 1], // Response_reg | CheW
				[], // TM | Cache_1 | TM | HAMP | MCPsignal
				[], // HAMP | MCPsignal
				[], // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
				[], // **
				[], // **
				[], // TM | TM | MCPsignal
				[], // TM | MCPsignal | Rhodanese
				[], // TM | TM | TM | TM | MCPsignal
				[], // TM | TM | TM | TM | TM | TM | MCPsignal
				[],  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				[], // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
				[], // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
				[], // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
				[] // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
			]
			let fqlService = new FQLService(setsOfRules)

			let results = []
			fqlService.initRules()
			let promises = []
			sampleData.forEach(function(item) {
				results.push(fqlService.findMatches(item).FQLMatches)
			})
			expect(results).eql(expected)
		})
	})
})
