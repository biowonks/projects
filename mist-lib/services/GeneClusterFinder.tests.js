/* eslint-disable no-magic-numbers, no-undefined */
'use strict'

// Local
let GeneClusterFinder = require('./GeneClusterFinder'),
	sampleGeneData = require('./test-data/sample-gene-data')

describe('Services', function() {
	describe('GeneClusterFinder', function() {
		describe('distanceCutoffBp', function() {
			it('default constructor returns the default cutoff', function() {
				let x = new GeneClusterFinder()
				expect(x.distanceCutoffBp()).equal(GeneClusterFinder.kDefaultDistanceCutoffBp)
			})

			it('arbitrary cutoff of 300', function() {
				expect(GeneClusterFinder.kDefaultDistanceCutoffBp).not.equal(300)
				let x = new GeneClusterFinder(300)
				expect(x.distanceCutoffBp()).equal(300)
			})
		})

		describe('findClusters', function() {
			let geneClusterFinder = null,
				cutoff = null
			beforeEach(() => {
				geneClusterFinder = new GeneClusterFinder(200)
			})

			it('does not mutate source genes array', function() {
				let genes = [
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
				]
				let oldGenes = genes.slice()
				geneClusterFinder.findClusters(genes)
				expect(genes).eql(oldGenes)
			})

			it('linear chromosome with one gene does not return any groups', function() {
				let genes = [
					{
						start: 1,
						stop: 10,
						strand: '+'
					}
				]
				let results = geneClusterFinder.findClusters(genes)
				expect(results).eql([])
			})

			it('circular chromosome with one gene does not return any groups', function() {
				let genes = [
					{
						start: 1,
						stop: 10,
						strand: '+'
					}
				]
				let results = geneClusterFinder.findClusters(genes, {isCircular: true, repliconLength: 30})
				expect(results).eql([])
			})

			it('multiple genes that do not group together on circular chromosome', function() {
				let genes = [
					{
						start: 301,
						stop: 400,
						strand: '+'
					},
					{
						start: 700,
						stop: 800,
						strand: '+'
					}
				]
				let results = geneClusterFinder.findClusters(genes, {isCircular: true, repliconLength: 850})
				expect(results).eql([])
			})
			describe('Cutoff should be inclusive', function() {
				it('same distance of cutoff should be grouped', function() {
					cutoff = geneClusterFinder.distanceCutoffBp()
					let genes = [
						{
							start: 1,
							stop: 10,
							strand: '+'
						},
						{
							start: 10 + cutoff,
							stop: 20 + cutoff,
							strand: '+'
						}
					]
					let results = geneClusterFinder.findClusters(genes, {isCircular: true, repliconLength: 850})
					expect(results).eql([genes])
				})
				it('1bp more than the cutoff should not be grouped', function() {
					cutoff = geneClusterFinder.distanceCutoffBp()
					let genes = [
						{
							start: 1,
							stop: 10,
							strand: '+'
						},
						{
							start: 11 + cutoff,
							stop: 20 + cutoff,
							strand: '+'
						}
					]
					let results = geneClusterFinder.findClusters(genes, {isCircular: true, repliconLength: 850})
					expect(results).eql([])
				})
			})

			it('gene on + strand followed by gene on - strand that is < cutoff should not be grouped', function() {
				let results = geneClusterFinder.findClusters([
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
				let genes = [
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
				]

				let results = geneClusterFinder.findClusters(genes)
				expect(results).deep.equal([
					[
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
					]
				])
			})

			it('gene on - strand followed by gene on - strand that is < cutoff should be grouped', function() {
				let results = geneClusterFinder.findClusters([
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
				let results = geneClusterFinder.findClusters([
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
				let results = geneClusterFinder.findClusters([
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
					let results = geneClusterFinder.findClusters([
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
					let results = geneClusterFinder.findClusters([
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
					let results = geneClusterFinder.findClusters([
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
					let results = geneClusterFinder.findClusters([
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
				it('If passed circular chromosome, throw Error if repliconLength  is not larger than the stop of last stop position', function() {
					let genes = [
						{
							start: 1,
							stop: 10,
							strand: '+'
						},
						{
							start: 20,
							stop: 30,
							strand: '+'
						},
						{
							start: 500,
							stop: 510,
							strand: '+'
						}
					]
					expect(function() {
						geneClusterFinder.findClusters(genes, {isCircular: true})
					}).throw(Error)
				})
				it('If not circular chromosome, repliconLength should not matter', function() {
					let genes = [
						{
							start: 1,
							stop: 10,
							strand: '+'
						},
						{
							start: 20,
							stop: 30,
							strand: '+'
						},
						{
							start: 500,
							stop: 510,
							strand: '+'
						}
					]
					let results = geneClusterFinder.findClusters(genes, {isCircular: false})
					expect(results).eql([
						[
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
						]
					])
				})
				it('If same strand, all genes at the end of chromosome should cluster together with the first group', function() {
					let results = geneClusterFinder.findClusters([
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
					], {isCircular: true, repliconLength: 450})
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
					let results = geneClusterFinder.findClusters([
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
					], {isCircular: true, repliconLength: 450})
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
					let results = geneClusterFinder.findClusters([
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
							start: 701,
							stop: 5,
							strand: '-'
						}
					], {isCircular: true, repliconLength: 750})
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
								start: 701,
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
					let results = geneClusterFinder.findClusters([
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
					], {isCircular: true, repliconLength: 750})
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
					let results = geneClusterFinder.findClusters([
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
					], {isCircular: true, repliconLength: 750})
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
				it('circular but the last gene ends far from the end of the replicon should not group with first gene', function() {
					let genes = [
						{
							start: 1,
							stop: 10,
							strand: '+'
						},
						{
							start: 20,
							stop: 30,
							strand: '+'
						},
						{
							start: 500,
							stop: 510,
							strand: '+'
						}
					]
					let results = geneClusterFinder.findClusters(genes, {isCircular: true, repliconLength: 800})
					expect(results).eql([
						[
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
						]
					])
				})
			})
			describe('Circular and overlapping', function() {
				it('Should handle this example with Circular and overlapping together', function() {
					let results = geneClusterFinder.findClusters([
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
					], {isCircular: true, repliconLength: 750})
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
				let results = geneClusterFinder.findClusters(sampleGeneData)
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
				let results = geneClusterFinder.findClusters([])
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
						geneClusterFinder.findClusters(fixture)
					}).throw(Error)
				})
			})
		})
	})
})
