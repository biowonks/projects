/* eslint-disable no-unused-expressions, no-magic-numbers, no-new */
'use strict'

// Local
const ComplementLocation = require('./ComplementLocation'),
	Location = require('./Location'),
	LocationPoint = require('./LocationPoint'),
	Seq = require('./Seq')

describe('ComplementLocation', function() {
	let seq = new Seq('ATCGNXATCG')
	//                 |   |    |
	//                 1   5    10

	describe('constructor', function() {
		it('throws with no arguments', function() {
			expect(function() {
				new ComplementLocation()
			}).throw(Error)
		})

		it('valid location works', function() {
			let location = new Location(new LocationPoint(1), new LocationPoint(3))
			new ComplementLocation(location)
		})
	})

	describe('lowerBound', function() {
		it('returns the start location points lower bound', function() {
			let lp1 = new LocationPoint(5),
				lp2 = new LocationPoint(10),
				x = new ComplementLocation(new Location(lp1, lp2))

			expect(x.lowerBound()).equal(lp1.lowerBound())
		})
	})

	describe('upperBound', function() {
		it('returns the stop location points upper bound', function() {
			let lp1 = new LocationPoint(5),
				lp2 = new LocationPoint(10),
				x = new ComplementLocation(new Location(lp1, lp2))

			expect(x.upperBound()).equal(lp2.upperBound())
		})
	})

	describe('strand', function() {
		it('always returns -', function() {
			let location = new Location(new LocationPoint(1), new LocationPoint(3)),
				x = new ComplementLocation(location)

			expect(x.strand()).equal('-')
		})

		it('complement(complement(location)) returns -', function() {
			let location = new Location(new LocationPoint(1), new LocationPoint(3)),
				x = new ComplementLocation(new ComplementLocation(location))

			expect(x.strand()).equal('-')
		})
	})

	describe('transcriptFrom', function() {
		describe('linear sequence', function() {
			it('1..3', function() {
				let location = new Location(new LocationPoint(1), new LocationPoint(3)),
					x = new ComplementLocation(location),
					result = x.transcriptFrom(seq)

				expect(result).instanceof(Seq)
				expect(result.sequence()).equal('GAT')
			})
		})

		describe('circular sequence', function() {
			let circularSeq = new Seq(seq.sequence()).setCircular()

			it('1..3', function() {
				let location = new Location(new LocationPoint(1), new LocationPoint(3)),
					x = new ComplementLocation(location),
					result = x.transcriptFrom(circularSeq)

				expect(result.isCircular()).false
				expect(result.sequence()).equal('GAT')
			})

			it('9..2', function() {
				let location = new Location(new LocationPoint(9), new LocationPoint(2)),
					x = new ComplementLocation(location),
					result = x.transcriptFrom(circularSeq)

				expect(result.isCircular()).false
				expect(result.sequence()).equal('ATCG')
			})
		})
	})
})
