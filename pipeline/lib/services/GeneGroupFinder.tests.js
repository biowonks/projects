/* eslint-disable no-magic-numbers, no-undefined */
'use strict'

// Local
let GeneGroupFinder = require('./GeneGroupFinder'),
	sampleGeneData = require('./test-data/sample-gene-data')

describe('Services', function() {
	describe.only('GeneGroupFinder', function() {
		describe('distanceCutoffBp', function() {
			it('default constructor returns the default cutoff', function() {
				let x = new GeneGroupFinder()
				expect(x.distanceCutoffBp()).equal(GeneGroupFinder.kDefaultDistanceCutoffBp)
			})

			it('arbitrary cutoff of 300', function() {
				expect(GeneGroupFinder.kDefaultDistanceCutoffBp).not.equal(300)
				let x = new GeneGroupFinder(300)
				expect(x.distanceCutoffBp()).equal(300)
			})
		})

		describe('findGroups', function() {
			let geneGroupFinder = null
			beforeEach(() => {
				geneGroupFinder = new GeneGroupFinder()
			})

			it('gene on + strand followed by gene on - strand that is < cutoff', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 10,
						strand: '+'
					},
					{
						start: 20,
						stop: 30,
						strand: '-'
					}
				])
				expect(results).deep.equal([])
			})

			it('Should just parse the input in the right way', function() {
				let results = geneGroupFinder.findGroups(sampleGeneData)
				expect(results).deep.equal(
					[
						[
							{start: 96849, stop: 99074, strand: '+'},
							{start: 99161, stop: 99631, strand: '+'},
							{start: 99711, stop: 100802, strand: '+'}
						],
						[
							{start: 102388, stop: 103758, strand: '+'},
							{start: 103818, stop: 103818, strand: '+'}],
						[
							{start: 104980, stop: 105405, strand: '-'},
							{start: 105412, stop: 106032, strand: '-'}
						]
					])
			})

			it('Should return empty if empty array is passed', function() {
				let results = geneGroupFinder.findGroups([])
				expect(results).deep.equal([])
			})

			it('Should fail if anything other than object is passed', function() {
				let fixtures =
					[
						'Davi',
						1234,
						true,
						undefined,
						function() {
							return false
						}
					]
				fixtures.forEach((fixture) => {
					expect(function() {
						geneGroupFinder.findGroups(fixture)
					}).throw(Error)
				})
			})
		})
	})
})
