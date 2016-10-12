'use strict'

let Fql = require('./Fql.js')

describe('Feature Query Language - FQL', function() {
	describe('Initialize Fql with restrict dataset of Aseqs', function() {
		it('Passing nothing is the same as passing an empty array', function() {
			let fql = new Fql()
			expect(fql.selection).eql([])
		})
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
	describe('Single feature request from single resource', function() {
		it('Request protein sequences with any number of matches, anywhere in the sequence, to a single domain from pfam29', function() {
			let fql = new Fql()
			let rules = [{
				resource: 'pfam29',
				feature: [
					{
						name: 'CheW',
						count: 0,
						position: [0]
					}
				]
			}]
			let result = fql.buildQuery(rules)
			expect(result).equal('...CheA, CheW, CheV, 2xCheW, 3xCheW and etc')
		})
		it('Request protein sequences with 1 match, anywhere in the sequence, to a single domain from pfam29', function() {
			let fql = new Fql()
			let rules = [{
				resource: 'pfam29',
				feature: [
					{
						name: 'CheW',
						count: 1,
						position: [0]
					}
				]
			}]
			let result = fql.buildQuery(rules)
			expect(result).equal('...CheA, CheW, CheV, 2xCheW, 3xCheW and etc')
		})
		describe('Invalid queries', function() {
			let fql = null
			beforeEach(() => {
				fql = new Fql()
			})
			it('? Specifying more positions than counts whould throw error ?')
			describe('Error handling about missing information', function() {
				it('Missing feature.name should throw Error', function() {
					let rules = [{
						resource: 'pfam29',
						feature: [
							{
								count: 1,
								position: [0]
							}
						]
					}]
					expect(fql.buildQuery.bind(fql, rules)).to.throw('Must give a name for the feature')
				})
				it('Missing feature.count assumes count = 1')
				it('Missing feature.position assumes any position')
				it('Missing resource should throw Error', function() {
					let rules = [{
						feature: [
							{
								name: 'CheW',
								count: 1,
								position: [0]
							}
						]
					}]
					expect(fql.buildQuery.bind(fql, rules)).to.throw('Must especify the resource')
				})
				it('Missing feature should throw Error', function() {
					let rules = [{
						resource: 'pfam29'
					}]
					expect(fql.buildQuery.bind(fql, rules)).to.throw('Must especify the feature')
				})
			})
			describe('Error handling for invalid format', function() {
				it('Passing anything but Array as value for feature should throw Error', function() {
					let rules = [{
						resource: 'pfam29',
						feature: {
							name: 'CheW',
							count: 1,
							position: [0]
						}
					}]
					expect(fql.buildQuery.bind(fql, rules)).to.throw('Value in feature must be an array')
				})
			})
		})
	})
	describe('Multiple features request from single resource', function() {
		it('Same position specified in two rules should mean OR')
	})
})
