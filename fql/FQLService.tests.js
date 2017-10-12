/* eslint-disable no-magic-numbers, no-undefined */
'use strict'
let expect = require('chai').expect,
	assert = require('chai').assert

let FQLService = require('./FQLService.js')
let sampleData = require('./test-data/sample-input-fql.json')


describe('Feature Query Language - FQL', function() {
	describe('Sanity checks', function() {
		it('If no rules are passed, it should fail', function(done) {
			let	fqlService = new FQLService()
			fqlService.initRules().then(function() {
				done(new Error('Expected to reject'))
			})
			.catch(function(err) {
				expect(Error('No rules have been passed in the constructor')).eql(err)
				done()
			})
			.catch(done)
		})
	})
	describe('Nuts and bolts ::', function() {
		it('check behaviour _addResources with two ruleIndex', function(done) {
			let	fqlService = new FQLService([[], []])
			fqlService.initRules().then(function() {
				let rc = 'pfam28'
				fqlService._addResources(rc, 0)
				fqlService._addResources(rc, 1)
				expect(fqlService.resources).eql([['pfam28'], ['pfam28']])
				done()
			})
			.catch(function(err) {
				done(err)
			})
		})
		it('check behaviour _addResources with single ruleIndex and adding same resource twice', function(done) {
			let	fqlService = new FQLService([[]])
			fqlService.initRules().then(function() {
				let rc = 'pfam28'
				fqlService._addResources(rc, 0)
				fqlService._addResources(rc, 0)
				rc = 'das'
				fqlService._addResources(rc, 0)
				fqlService._addResources(rc, 0)
				expect(fqlService.resources).eql([['pfam28', 'das']])
				done()
			})
			.catch(function(err) {
				done(err)
			})
		})
		it('check behaviour _addResources with two ruleIndex and adding same resource twice', function(done) {
			let	fqlService = new FQLService([[], []])
			fqlService.initRules().then(function() {
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
				done()
			})
			.catch(function(err) {
				done(err)
			})
		})
		it('check behaviour _seqDepotInfoToArray', function(done) {
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
			fqlService.initRules().then(function() {
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
				let expression = fqlService._seqDepotInfoToArray(info, 0)
				expect(expression).eql(
					[
						'TM@das',
						'Cache_1@pfam28',
						'TM@das',
						'HAMP@pfam28',
						'MCPsignal@pfam28'
					]
				)
				done()
			})
			.catch(function(err) {
				done(err)
			})
		})
		it.skip('check behaviour _getConfig')
		describe('check behaviour of _parseRules', function() {
			it('with missing pos', function(done) {
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
				fqlService.initRules().then(function() {
					expect(fqlService.parsedSetsOfRules[0][0].pos).to.be.null
					expect(fqlService.parsedSetsOfRules[0][0].Npos).to.not.be.null
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('with missing Npos', function(done) {
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
				fqlService.initRules().then(function() {
					expect(fqlService.parsedSetsOfRules[0][0].pos).to.not.be.null
					expect(fqlService.parsedSetsOfRules[0][0].Npos).to.be.null
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('with missing Npos and pos', function(done) {
				let setOfRules = [{}]
				let	fqlService = new FQLService([setOfRules])
				fqlService.initRules().then(function() {
					expect(fqlService.parsedSetsOfRules[0][0].pos).to.be.null
					expect(fqlService.parsedSetsOfRules[0][0].Npos).to.be.null
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('with pos and Npos', function(done) {
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
				fqlService.initRules().then(function() {
					let parsed = fqlService._parseRules(rules, 0)
					expect(parsed).eql(expected)
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('with `AND` type of pos rules', function(done) {
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
				fqlService.initRules().then(function() {
					let parsed = fqlService._parseRules(rules, 0)
					expect(parsed).eql(expected)
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('with `^` and `$` fql instructions in pos rules', function(done) {
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
				fqlService.initRules().then(function() {
					let parsed = fqlService._parseRules(rules, 0)
					expect(parsed).eql(expected)
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
		})
		describe('Checking behaviour of _parseCount', function() {
			it('Too many commas', function(done) {
				let countInfo = '{1,2,3}'
				let fqlService = new FQLService([[]])
				fqlService.initRules().then(function() {
					expect(fqlService._parseCount.bind(fqlService, countInfo)).to.throw('Invalid count value (too many commas): ' + countInfo)
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('It must be an integer 1', function(done) {
				let countInfo = '{1,a}'
				let fqlService = new FQLService([[]])
				fqlService.initRules().then(function() {
					expect(fqlService._parseCount.bind(fqlService, countInfo)).to.throw('Invalid count value (only integers): ' + countInfo)
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('It must be an integer 2', function(done) {
				let countInfo = '{1,2.3}'
				let fqlService = new FQLService([[]])
				fqlService.initRules().then(function() {
					expect(fqlService._parseCount.bind(fqlService, countInfo)).to.throw('Invalid count value (only integers): ' + countInfo)
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('It must work with single number', function(done) {
				let fqlService = new FQLService([[]])
				fqlService.initRules().then(function() {
					let countInfo = '{7}',
						parsed = fqlService._parseCount(countInfo)
					expect(parsed).eql([7, 7])
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('It must work with two numbers', function(done) {
				let fqlService = new FQLService([[]])
				fqlService.initRules().then(function() {
					let countInfo = '{1,7}',
						parsed = fqlService._parseCount(countInfo)
					expect(parsed).eql([1, 7])
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('It must work with no number in the first place', function(done) {
				let fqlService = new FQLService([[]])
				fqlService.initRules().then(function() {
					let countInfo = '{,7}',
						parsed = fqlService._parseCount(countInfo)
					expect(parsed).eql([0, 7])
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('It must work with no number in the second place', function(done) {
				let fqlService = new FQLService([[]])
				fqlService.initRules().then(function() {
					let countInfo = '{1,}',
						parsed = fqlService._parseCount(countInfo)
					expect(parsed).eql([1, Infinity])
					done()
				})
				.catch(function(err) {
					done(err)
				})
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
		it('After initRules, all resources used in rules should appear in .resources', function(done) {
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
			fqlService.initRules(setOfRules).then(function() {
				let expected = ['pfam29', 'das']
				expect(fqlService.resources).eql([expected])
				done()
			})
			.catch(function(err) {
				done(err)
			})
		})
		describe('Missing pos or Npos in arguments should pass pos and Npos null rules', function() {
			it('Missing pos should pass undefined for rules.pos', function(done) {
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
				fqlService.initRules().then(function() {
					expect(fqlService.setsOfRules[0].pos).to.be.undefined
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
		})
		describe('Checking the integrity of rules - should throw informative Errors', function() {
			it.skip('Missing mandatory field in pos type rule resource should throw Error', function() {
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
			it.skip('Missing mandatory field in pos type rule feature should throw Error', function() {
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
			it.skip('Missing both mandatory fields in pos type rule resource and feature should throw Error', function() {
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
			it.skip('Missing mandatory field in Npos type rule resource should throw Error', function() {
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
			it.skip('Missing mandatory field in Npos type rule feature should throw Error', function() {
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
			it.skip('Missing both mandatory fields in Npos type rule resource and feature should throw Error', function() {
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
			it.skip('Wrong wild card "*" instead of ".*" in positional rules', function() {
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
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Wrong wild card. Change "*" to ".*" in:\n{"resource":"pfam28","feature":"*","count":"{2}"}')
			})
			it.skip('Wrong wild card "*" instead of ".*" in non-positional rules', function() {
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
				expect(fql.loadRules.bind(fql, setOfRules)).to.throw('Wrong wild card. Change "*" to ".*" in:\n{"resource":"pfam28","feature":"*","count":"{2}"}')
			})
		})
	})
	describe('Non positional rules :: ', function() {
		describe('Single Rule - If broken, fix this first', function() {
			it.only('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single CheW domain from pfam29', function(done) {
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
				let results = []
				fqlService.initRules().then(function() {
					let promises = []
					sampleData.forEach(function(item) {
						promises.push(fqlService.findMatches(item))
					})
					Promise.all(promises).then(function(items) {
						items.forEach(function(item, i) {
							expect(expected[i], 'Error index ' + i).eql(item.FQLMatches)
						})
						done()
					})
					.catch(function(err) {
						done(err)
					})
				})
				.catch(function(error) {
					done(error)
				})
			})
			it('Filter proteins sequences with 1 match, anywhere in the sequence, to a single CheW domain from pfam29', function() {
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
			})
			it('Filter proteins sequences with 1 or 2 matches, anywhere in the sequence, to a single CheW domain from pfam29', function() {
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
			})
			it('Filter proteins sequences with 2 or 3 matches, anywhere in the sequence, to a single CheW domain from pfam29', function() {
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
			})
			it('Filter proteins with 1 domain from pfam28', function() {
				let fql = new Fql()
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
				fql.initRules(setOfRules)
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
					true, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					true, // TM | TM | TM | TM | MCPsignal
					true, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
		})
		describe('Multiple Rules - AND mode', function() {
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
			})
		})
		describe('Multiple Rules - OR mode', function() {
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
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
				fql.initRules(setOfRules)
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
				expect(fql.match).eql(expected)
			})
		})
	})
	describe('Positional rules :: ', function() {
		describe('Simple matches :: ', function() {
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
			it('Filter protein sequences starting with 1 TM follow by any 2 feature and another TM', function() {
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
				fql.initRules(setOfRules)
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
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
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
				fql.initRules(setOfRules)
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
				fqlP.initRules(setOfRulesPos)
				fqlP.applyFilter(sampleData)
				fqlNP.initRules(setOfRulesNonPos)
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
				fql.initRules(setOfRules)
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
			it('Filter sequences with starts with TM-Cache_1 and end in MCPsignal', function() {
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
				fql.initRules(setOfRules)
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
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter sequences with starts with TM-Cache_1 followed by anything BUT another Cache_1 and end in MCPsignal', function() {
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
				fql.initRules(setOfRules)
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
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
			it('Filter sequences with starts with TM-Cache_2 and end in MCPsignal', function() {
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
				fql.initRules(setOfRules)
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
					true,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					true // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
		})
		describe('Testing the behaviour of "count" for positional rules :: ', function() {
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
		describe('Testing the behaviour of wildcard for positional rules', function() {
			it('Filter protein sequences with any 2 pfam28 domains', function() {
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
				fql.initRules(setOfRules)
				fql.applyFilter(sampleData)
				let expected = [
					true, // CheW | CheW
					true, // CheW | Response_reg
					false, // CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | CheW
					false, // Hpt | P2 | H-kinase_dim | HATPase_c | CheW | Response_reg
					false, // CheW | CheW | CheW
					false, // Response_reg | NMT1_2 | CheW
					true, // CheW | CheR
					true, // Response_reg | CheW
					false, // TM | Cache_1 | TM | HAMP | MCPsignal
					true, // HAMP | MCPsignal
					false, // PAS_9 | PAS | PAS_4 | PAS_3 | TM | TM | MCPsignal
					false, // **
					false, // **
					false,  // TM | TM | MCPsignal
					true,  // TM | TM | MCPsignal | Rhodanese
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
			it('Filter protein sequences with 1 or more domains between 2 TM regions in the beginning of the sequence and with MCPsignal at the end', function() {
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
					true, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
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
				fql.initRules(setOfRules)
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
				fql.initRules(setOfRules)
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
	describe('Complex queries', function() {
		describe('Same position specified in two rules should mean OR', function() {
			it('Filter sequences with starts with TM-Cache_1 or TM-Cache_2 and end in MCPsignal', function() {
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
				fql.initRules(setOfRules)
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
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
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
		describe('Combining Npos and pos rules', function() {
			it('Filter protein sequences that starts with TM-Cache1 and ends with MCPsignal but does not have Cache_2 anywhere', function() {
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
				fql.initRules(setOfRules)
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
					false, // TM | TM | MCPsignal
					false, // TM | MCPsignal | Rhodanese
					false, // TM | TM | TM | TM | MCPsignal
					false, // TM | TM | TM | TM | TM | TM | MCPsignal
					false,  // TM | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
					false, // TM | Cache_2 | Cache_1 | TM | HAMP | MCPsignal
					false, // TM | Cache_1 | Cache_2 | TM | HAMP | MCPsignal
					true, // TM | Cache_1 | Cache_1 | TM | HAMP | MCPsignal
					false // TM | Cache_2 | Cache_2 | Cache_2 | TM | HAMP | MCPsignal
				]
				expect(fql.match).eql(expected)
			})
		})
	})
})
