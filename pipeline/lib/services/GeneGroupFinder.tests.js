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
			let geneGroupFinder = null,
				cutoff = null
			beforeEach(() => {
				geneGroupFinder = new GeneGroupFinder()
				cutoff = geneGroupFinder.distanceCutoffBp()
			})

			it('throw error if gene does not have a + or - strand')

			it('does not mutate source genes array')

			it('linear chromosome with one gene does not return any groups')

			it('circular chromosome with one gene does not return any groups')

			it('multiple genes that do not group together on circular chromosome', function() {
				let gene1 = {
					start: cutoff + 1,
					stop: null,
					strand: '+'
				}
				gene1.stop = gene1.start + 100
				let gene2 = {
					start: gene1.stop + cutoff + 1,
					stop: null,
					strand: '+'
				}
				gene2.stop = gene2.start + 100
				let results = geneGroupFinder.findGroups([gene1, gene2], true)
				expect(results).eql([])
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
				// Define the genes as variables so that referencing from the group results is more
				// straightforward.
				//
				// Also note how we use the cutoff variable to define our separation. This ensures
				// that our test continues to work as expected even if the default is changed in the
				// GeneGroupFinder definition.
				let gene1 = {
						start: 1,
						stop: 10,
						strand: '+'
					},
					gene2 = {
						start: gene1.stop + cutoff - 1,
						stop: null,
						strand: '+'
					}
				gene2.stop = gene2.start + 10

				let results = geneGroupFinder.findGroups([
					gene1,
					gene2
				])
				expect(results).deep.equal([
					[
						gene1,
						gene2
					]
				])
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
			describe('Dealing with overlapping genes', function() {
				it('case: patial overlap. If same strand, then they should cluster together', function() {
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

				it('case: patial overlap. If different strand, then they should NOT cluster together', function() {
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

				it('case: full overlap. If same strand, then they should cluster together', function() {
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

				it('case: full overlap. If different strand, then they should NOT cluster together', function() {
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
			})
			describe('Dealing with circular chromosomes and genes crossing origins', function() {
				it('If same strand, all genes at the end of chromosome should cluster together with the first group', function() {
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
					], true)
					expect(results).deep.equal([
						[
							{
								start: 400,
								stop: 5,
								strand: '-'
							},
							{
								start: 10,
								stop: 50,
								strand: '-'
							},
							{
								start: 60,
								stop: 100,
								strand: '-'
							}
						]
					])
				})
				it('If not the same strand, all genes at the end of chromosome should NOT cluster together with the first group', function() {
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
							strand: '+'
						}
					], true)
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
							}
						]
					])
				})
				it('If same strand and under cutoff, the group at the end of chromosome should cluster together with the first gene', function() {
					let results = geneGroupFinder.findGroups([
						{
							start: 10,
							stop: 50,
							strand: '-'
						},
						{
							start: 260,
							stop: 300,
							strand: '-'
						},
						{
							start: 400,
							stop: 500,
							strand: '-'
						},
						{
							start: 700,
							stop: 5,
							strand: '-'
						}
					], true)
					expect(results).deep.equal([
						[
							{
								start: 260,
								stop: 300,
								strand: '-'
							},
							{
								start: 400,
								stop: 500,
								strand: '-'
							}
						],
						[
							{
								start: 700,
								stop: 5,
								strand: '-'
							},
							{
								start: 10,
								stop: 50,
								strand: '-'
							}
						]
					])
				})
				it('all genes are part of the 1 group from backwards, return should be in order', function() {
					let results = geneGroupFinder.findGroups([
						{
							start: 210,
							stop: 240,
							strand: '-'
						},
						{
							start: 260,
							stop: 300,
							strand: '-'
						},
						{
							start: 400,
							stop: 510,
							strand: '-'
						},
						{
							start: 700,
							stop: 5,
							strand: '-'
						}
					], true)
					expect(results).deep.equal([
						[
							{
								start: 210,
								stop: 240,
								strand: '-'
							},
							{
								start: 260,
								stop: 300,
								strand: '-'
							},
							{
								start: 400,
								stop: 510,
								strand: '-'
							},
							{
								start: 700,
								stop: 5,
								strand: '-'
							}
						]
					])
				})
				it('If same strand but not under cutoff, the last group should be at the end of the returned groups', function() {
					let results = geneGroupFinder.findGroups([
						{
							start: 210,
							stop: 240,
							strand: '-'
						},
						{
							start: 260,
							stop: 300,
							strand: '-'
						},
						{
							start: 510,
							stop: 610,
							strand: '-'
						},
						{
							start: 700,
							stop: 5,
							strand: '-'
						}
					], true)
					expect(results).deep.equal([
						[
							{
								start: 210,
								stop: 240,
								strand: '-'
							},
							{
								start: 260,
								stop: 300,
								strand: '-'
							}
						],
						[
							{
								start: 510,
								stop: 610,
								strand: '-'
							},
							{
								start: 700,
								stop: 5,
								strand: '-'
							}
						]
					])
				})
			})
			describe(' Circular and overlapping', function() {
				it('Should handle this example with Circular and overlapping together', function() {
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
						},
						{
							start: 250,
							stop: 255,
							strand: '-'
						},
						{
							start: 260,
							stop: 300,
							strand: '-'
						},
						{
							start: 510,
							stop: 610,
							strand: '-'
						},
						{
							start: 700,
							stop: 5,
							strand: '-'
						}
					], true)
					expect(results).deep.equal([
						[
							{
								start: 250,
								stop: 255,
								strand: '-'
							},
							{
								start: 260,
								stop: 300,
								strand: '-'
							}
						],
						[
							{
								start: 510,
								stop: 610,
								strand: '-'
							},
							{
								start: 700,
								stop: 5,
								strand: '-'
							},
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
