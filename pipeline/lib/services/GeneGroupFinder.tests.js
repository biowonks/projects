/* eslint-disable no-magic-numbers, no-undefined */
'use strict'

// Local
let GeneGroupFinder = require('./GeneGroupFinder'),
	sampleGeneData = require('./test-data/sample-gene-data')

describe('Services', function() {
	describe('GeneGroupFinder', function() {
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

			it('gene on + strand followed by gene on - strand that is < cutoff should not be grouped', function() {
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

			it('gene on + strand followed by gene on + strand that is < cutoff should be grouped', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 10,
						strand: '+'
					},
					{
						start: 20,
						stop: 30,
						strand: '+'
					}
				])
				expect(results).deep.equal([[
					{
						start: 1,
						stop: 10,
						strand: '+'
					},
					{
						start: 20,
						stop: 30,
						strand: '+'
					}
				]])
			})

			it('gene on - strand followed by gene on - strand that is < cutoff should be grouped', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 10,
						strand: '-'
					},
					{
						start: 20,
						stop: 30,
						strand: '-'
					}
				])
				expect(results).deep.equal([[
					{
						start: 1,
						stop: 10,
						strand: '-'
					},
					{
						start: 20,
						stop: 30,
						strand: '-'
					}
				]])
			})

			it('gene groups with different strands should be groupped separetely', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 10,
						strand: '-'
					},
					{
						start: 20,
						stop: 30,
						strand: '-'
					},
					{
						start: 40,
						stop: 50,
						strand: '+'
					},
					{
						start: 60,
						stop: 70,
						strand: '+'
					}
				])
				expect(results).deep.equal([
					[
						{
							start: 1,
							stop: 10,
							strand: '-'
						},
						{
							start: 20,
							stop: 30,
							strand: '-'
						}
					],
					[
						{
							start: 40,
							stop: 50,
							strand: '+'
						},
						{
							start: 60,
							stop: 70,
							strand: '+'
						}
					]
				])
			})

			it('gene groups with same strand but different distant from each other should be groupped separetely', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 10,
						strand: '-'
					},
					{
						start: 20,
						stop: 30,
						strand: '-'
					},
					{
						start: 231,
						stop: 240,
						strand: '-'
					},
					{
						start: 260,
						stop: 270,
						strand: '-'
					}
				])
				expect(results).deep.equal([
					[
						{
							start: 1,
							stop: 10,
							strand: '-'
						},
						{
							start: 20,
							stop: 30,
							strand: '-'
						}
					],
					[
						{
							start: 231,
							stop: 240,
							strand: '-'
						},
						{
							start: 260,
							stop: 270,
							strand: '-'
						}
					]
				])
			})

			it('Dealing with overlapping genes - case: patial overlap. If same strand, then they should cluster together', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 10,
						strand: '-'
					},
					{
						start: 5,
						stop: 30,
						strand: '-'
					}
				])
				expect(results).deep.equal([
					[
						{
							start: 1,
							stop: 10,
							strand: '-'
						},
						{
							start: 5,
							stop: 30,
							strand: '-'
						}
					]
				])
			})

			it('Dealing with overlapping genes - case: patial overlap. If different strand, then they should NOT cluster together', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 10,
						strand: '-'
					},
					{
						start: 5,
						stop: 30,
						strand: '+'
					}
				])
				expect(results).deep.equal([])
			})

			it('Dealing with overlapping genes - case: full overlap. If same strand, then they should cluster together', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 50,
						strand: '-'
					},
					{
						start: 5,
						stop: 30,
						strand: '-'
					}
				])
				expect(results).deep.equal([
					[
						{
							start: 1,
							stop: 50,
							strand: '-'
						},
						{
							start: 5,
							stop: 30,
							strand: '-'
						}
					]
				])
			})

			it('Dealing with overlapping genes - case: full overlap. If different strand, then they should NOT cluster together', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 1,
						stop: 50,
						strand: '-'
					},
					{
						start: 5,
						stop: 30,
						strand: '+'
					}
				])
				expect(results).deep.equal([])
			})

			it.only('Dealing with circular chromosomes - If same strand, then they should cluster together', function() {
				let results = geneGroupFinder.findGroups([
					{
						start: 10,
						stop: 50,
						strand: '-'
					},
					{
						start: 60,
						stop: 100,
						strand: '-'
					},
					{
						start: 400,
						stop: 5,
						strand: '-'
					}
				])
				expect(results).deep.equal([
					[
						{
							start: 10,
							stop: 50,
							strand: '-'
						},
						{
							start: 60,
							stop: 100,
							strand: '-'
						},
						{
							start: 400,
							stop: 5,
							strand: '-'
						}
					]
				])
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
							{start: 103818, stop: 103818, strand: '+'}
						],
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
