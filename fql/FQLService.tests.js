/* eslint-disable no-magic-numbers, no-undefined */
'use strict'
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

let expect = require('chai').expect

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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Each pos rule must explicitly define a resource: \n{"feature":"Response_reg"}')
					})
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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Each pos rule must explicitly define a feature: \n{"resource":"pfam29"}')
					})
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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Each pos rule must explicitly define a resource and feature: \n{}')
					})
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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Each Npos rule must explicitly define a resource: \n{"feature":"Response_reg"}')
					})
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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Each Npos rule must explicitly define a feature: \n{"resource":"pfam29"}')
					})
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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Each Npos rule must explicitly define a resource and feature: \n{}')
					})
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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Wrong wild card. Change "*" to ".*" in:\n{"resource":"pfam28","feature":"*","count":"{2}"}')
					})
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
				return expect(fqlService.initRules()).to.be.rejected
					.then(function(err) {
						expect(err).to.have.property('message', 'Wrong wild card. Change "*" to ".*" in:\n{"resource":"pfam28","feature":"*","count":"{2}"}')
					})
			})
		})
	})
	describe('Non positional rules :: ', function() {
		describe('Single Rule - If broken, fix this first', function() {
			it('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single CheW domain from pfam29', function(done) {
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
			it('Filter proteins sequences with 1 or 2 matches, anywhere in the sequence, to a single CheW domain from pfam29', function(done) {
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
			it('Filter proteins sequences with 2 or 3 matches, anywhere in the sequence, to a single CheW domain from pfam29', function(done) {
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
			it('Filter proteins sequences with 3 or more transmembrane regions, anywhere in the sequence', function(done) {
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
			it('Filter proteins sequences without transmembrane regions', function(done) {
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
			it('Filter proteins with 1 domain from pfam28', function(done) {
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
		})
		describe('Multiple Rules - AND mode', function() {
			it('Filter proteins sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28', function(done) {
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
			it('Filter proteins sequences with at least 1 match to CheW domain in pfam28 AND only 1 match to HATPase_c domain in pfam28', function(done) {
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
		})
		describe('Multiple Rules - OR mode', function() {
			it('Filter proteins sequences with at least 2 matches to CheW domain in pfam28 OR only 1 match to HATPase_c domain in pfam28', function(done) {
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
			it('Filter proteins sequences with at least 2 match to CheW domain in pfam28 OR only 1 match to HATPase_c domain in pfam28 OR only 1 matches to Response_reg in pfam28', function(done) {
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
		})
	})
	describe('Positional rules :: ', function() {
		describe('Simple matches :: ', function() {
			it('Filter protein sequences starting with 1 match to a CheW domain from Pfam28', function(done) {
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
			it('Filter protein sequences starting with 2 CheW domains from Pfam28', function(done) {
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
			it('Filter protein sequences starting with 2 or more CheW domains from Pfam28', function(done) {
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
			it('Filter protein sequences starting with 1 TM followed by 1 Cache_2 domain from Pfam28', function(done) {
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
			it('Filter protein sequences starting with 1 TM follow by any 2 feature and another TM', function(done) {
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
			it('Filter proteins sequences with any number of matches, anywhere in the sequence, to a single domain from pfam28', function(done) {
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
			it('Non-positional and positional rules can have the same output', function(done) {
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
			it.skip('Don\'t know why doesn\'t work - Two different rules should not give the same output', function(done) {
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

				let fqlPromiseP = new Promise(function(res, rej) {
					fqlServiceP.initRules().then(function() {
						console.log('Pos Rules')
						console.log(JSON.stringify(fqlServiceP.parsedSetsOfRules))
						let promises = []
						sampleData.slice(0, 1).forEach(function(item) {
							console.log('PosMatch-Promise')
							console.log(fqlServiceP.findMatches(item))
							promises.push(fqlServiceP.findMatches(item))
						})
						Promise.all(promises).then(function(items) {
							console.log('PosMatch')
							console.log(items)
							res(items)
						})
						.catch(function(err) {
							rej(err)
						})
					})
					.catch(function(error) {
						rej(error)
					})
				})

				let fqlPromiseNP = new Promise(function(res, rej) {
					fqlServiceNP.initRules().then(function() {
						console.log('NonPos Rules')
						console.log(JSON.stringify(fqlServiceNP.parsedSetsOfRules))
						let promises = []
						sampleData.slice(0, 1).forEach(function(item) {
							console.log('NonPosMatch-Promise')
							console.log(fqlServiceNP.findMatches(item))
							promises.push(fqlServiceNP.findMatches(item))
						})
						Promise.all(promises).then(function(items) {
							console.log('PosMatch')
							console.log(items)
							res(items)
						})
						.catch(function(err) {
							rej(err)
						})
					})
					.catch(function(error) {
						rej(error)
					})
				})

				Promise.all([fqlPromiseNP, fqlPromiseP]).then(function(results) {
					console.log(JSON.stringify(results))
					expect(results[0]).not.eql(results[1])
					done()
				})
				.catch(function(err) {
					done(err)
				})
			})
			it('Filter protein sequences with 1 match to a CheW domain from Pfam28', function(done) {
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
			it('Filter sequences with starts with TM-Cache_1 and end in MCPsignal', function(done) {
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
			it('Filter sequences with starts with TM-Cache_1 followed by anything BUT another Cache_1 and end in MCPsignal', function(done) {
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
			it('Filter sequences with starts with TM-Cache_2 and end in MCPsignal', function(done) {
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
		})
		describe('Testing the behaviour of "count" for positional rules :: ', function() {
			it('Request protein sequences with 2 matches and nothing else to a single domain from pfam28', function(done) {
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
			it('Request protein sequences with 3 matches and nothing else to a single domain from pfam28', function(done) {
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
			it('Filter protein sequences with 2 or 3 matches and nothing else to a single domain from pfam28', function(done) {
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
			it('Request protein sequences with 2 or 3 matches at the end of the sequence to a single domain from pfam28', function(done) {
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
			it('Request protein sequences with 2 TM regions anywhere in the sequence with MCPsignal at the end', function(done) {
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
		})
		describe('Testing the behaviour of wildcard for positional rules', function() {
			it('Filter protein sequences with any 2 pfam28 domains', function(done) {
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
			it('Filter protein sequences with 1 or more domains between 2 TM regions in the beginning of the sequence and with MCPsignal at the end', function(done) {
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
			it('Filter protein sequences starting with no Cache_1 between two TM and ending a MCPsignal', function(done) {
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
			it('Filter protein sequences starting with TM followed by any two domains from pfam28 but no Cache_1 followed by another TM and ending a MCPsignal', function(done) {
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
			it('Filter protein sequences starting with TM followed by any two domains from pfam28 but Cache_1 not in the first of the two followed by another TM and ending a MCPsignal', function(done) {
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
			it('Filter sequences that start with TM and end with MCPsignal.', function(done) {
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
			it('Filter protein sequences that starts with at least 3 domains of the PAS family using wildcards "PAS.*"', function(done) {
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
		})
	})
	describe('Complex queries', function() {
		describe('Same position specified in two rules should mean OR', function() {
			it('Filter sequences with starts with TM-Cache_1 or TM-Cache_2 and end in MCPsignal', function(done) {
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
		})
		describe('Combining Npos and pos rules', function() {
			it('Filter protein sequences that starts with TM-Cache1 and ends with MCPsignal but does not have Cache_2 anywhere', function(done) {
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
		})
	})
	describe('Sets of rules should also work', function() {
		it('two equal rules must match same entries', function(done) {
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
		it('Two different rules matching different entries', function(done) {
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
		it('Overlapping rules matching different entries', function(done) {
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
	})
})
