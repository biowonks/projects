'use strict'

let LocationStringParser = require('./LocationStringParser'),
	Seq = require('./Seq')

describe('LocationStringParser', function() {
	describe('constructor', function() {

	})

	describe('parse', function() {
		let x = new LocationStringParser(),
			seq = new Seq('ATCGATCGATCG'),
			examples = [
				{ls: 'join(1..2,complement(4..6),9)', sequence: 'ATATCA'}

				// 'join(12..78,134..202)',
				// 'complement(join(2691..4571,4918..5163))',
				// 'join(complement(4918..5163),complement(2691..4571))'
			]

		examples.forEach(function(example) {
			it(example.ls + ' --> ' + example.sequence, function() {
				let location = x.parse(example.ls)
				expect(location.transcriptFrom(seq).sequence()).equal(example.sequence)
			})
		})
	})
})
