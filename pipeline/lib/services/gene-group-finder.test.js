'use strict'

let path = require('path'),
	GeneGroupFinder = require('./gene-group-finder.js')

let genePositionStrand = path.resolve(__dirname, 'test-data', 'sample-gene-groups.js')

let geneGroupFinder = new GeneGroupFinder()

let groups = geneGroupFinder(genePositionStrand).groups

console.log(groups)
