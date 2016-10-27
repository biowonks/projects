/* eslint-disable no-magic-numbers */

'use strict'

// Local
const LocationStringParser = require('./LocationStringParser'),
	Seq = require('core-lib/bio/Seq')

describe('LocationStringParser', function() {
	describe('parse', function() {
		let x = new LocationStringParser(),
			seq = new Seq('ATCGATCGAT').setCircular()
			//             |   |    |
			//             1   5    10

		describe('invalid location strings', function() {
			let examples = [
				'blargh',
				'join()',
				'join(..)',
				'join(1..',
				'complement()',
				'complement(1..',
				'complement(1..2,5..6)',
				':1..2'
			]

			examples.forEach((example) => {
				it(`${example} throws error`, function() {
					expect(function() {
						x.parse(example)
					}).throw(Error)
				})
			})
		})

		describe('valid locations', function() {
			let examples = [
				{locationString: '3', sequence: 'C'},
				{locationString: '2..4', sequence: 'TCG'},
				{locationString: '10..1', sequence: 'TA'},
				{locationString: '7^8', sequence: 'CG'},
				{locationString: '1.3', sequence: 'ATC'},

				{locationString: 'join(1..2)', sequence: 'AT'},
				{locationString: 'join(1..2,4)', sequence: 'ATG'},
				{locationString: 'join(1,3..4)', sequence: 'ACG'},
				{locationString: 'join(1..3,8..10)', sequence: 'ATCGAT'},
				{locationString: 'join(1..3,1..3)', sequence: 'ATCATC'},

				{locationString: 'complement(3)', sequence: 'G'},
				{locationString: 'complement(3..4)', sequence: 'CG'},
				{locationString: 'complement(join(9..10,10..1))', sequence: 'TAAT'},

				{locationString: 'join(1..2,complement(4..6),9)', sequence: 'ATATCA'},
				{locationString: 'join(complement(join(3..4,6..7)),1..2)', sequence: 'GACGAT'},
				{locationString: 'join(complement(2..4),complement(10..3))', sequence: 'CGAGATA'}
			]

			examples.forEach(function(example) {
				it(`${example.locationString} --> ${example.sequence}`, function() {
					let location = x.parse(example.locationString)
					expect(location.transcriptFrom(seq).sequence()).equal(example.sequence)
				})
			})
		})

		describe('order', function() {
			it('order(25348..25416,24661..24729)', function() {
				let locationString = 'order(25348..25416,24661..24729)',
					location = x.parse(locationString)

				expect(location.lowerBound()).equal(25348)
				expect(location.upperBound()).equal(24729)
			})

			it('complement(order(25348..25416,24661..24729))', function() {
				let locationString = 'complement(order(25348..25416,24661..24729))',
					location = x.parse(locationString)

				expect(location.lowerBound()).equal(25348)
				expect(location.upperBound()).equal(24729)
			})

			it('behaves like a join when transcribing the sequence', function() {
				let examples = [
					{locationString: 'join(1..2,4)', sequence: 'ATG'}
				]
				examples.forEach(function(example) {
					it(`${example.locationString} --> ${example.sequence}`, function() {
						let location = x.parse(example.locationString)
						expect(location.transcriptFrom(seq).sequence()).equal(example.sequence)
					})
				})
			})
		})
	})
})
