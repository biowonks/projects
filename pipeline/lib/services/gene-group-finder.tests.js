'use strict'

let path = require('path'),
	GeneGroupFinder = require('./gene-group-finder.js')

let genePositionStrand = require('./test-data/sample-gene-group')

describe('Services', function() {
	describe.only('GeneGroupFinder', function() {
		it('Should just parse the input in the right way', function() {
			let geneGroupFinder = new GeneGroupFinder()
			geneGroupFinder.parse(genePositionStrand)
			let results = geneGroupFinder.groups
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
		it('Should return empy if empty object is passed', function() {
			let geneGroupFinder = new GeneGroupFinder()
			let emptyObject = []
			geneGroupFinder.parse(emptyObject)
			let results = geneGroupFinder.groups
			expect(results).deep.equal([])
		})
		it('Should fail if anything other than object is passed', function() {
			let fixtures =
				[
					'Davi',
					[
						{start: 96849, stop: 99074, strand: '+'},
						{start: 99161, stop: 99631, strand: '+'}
					],
					1234,
					true,
					undefined,
					function() {
						return false
					}
				]
			let geneGroupFinder = new GeneGroupFinder()
			let emptyObject = 'dadasda'
			fixtures.forEach(function(fixture) {
				expect(function() {
					geneGroupFinder.parse(emptyObject)
					let results = geneGroupFinder.groups
				}).throw(Error)
			})
		})
	})
})
