/* eslint-disable no-magic-numbers, no-new */
'use strict'

// Local
const JoinLocation = require('./JoinLocation'),
	ComplementLocation = require('./ComplementLocation'),
	Location = require('./Location'),
	LocationPoint = require('./LocationPoint'),
	Seq = require('./Seq')

describe('JoinLocation', function() {
	describe('constructor', function() {
		it('throws with no arguments', function() {
			expect(function() {
				new JoinLocation()
			}).throw(Error)
		})

		it('throws with empty locations array', function() {
			expect(function() {
				new JoinLocation([])
			}).throw(Error)
		})
	})

	describe('bounds', function() {
		let location1 = new Location(new LocationPoint(8), new LocationPoint(10)),
			location2 = new Location(new LocationPoint(1), new LocationPoint(2)),
			x = new JoinLocation([location1, location2])

		describe('lowerBound', function() {
			it('returns the first locations lower bound', function() {
				expect(x.lowerBound()).equal(location1.lowerBound())
			})
		})

		describe('upperBound', function() {
			it('returns the last locations upper bound', function() {
				expect(x.upperBound()).equal(location2.upperBound())
			})
		})
	})

	describe('length', function() {
		let notCircular = false,
			circular = true

		it('linear join(1..2,5..6) is 4', function() {
			let location1 = new Location(new LocationPoint(1), new LocationPoint(2)),
				location2 = new Location(new LocationPoint(5), new LocationPoint(6)),
				x = new JoinLocation([location1, location2])

			expect(x.length(notCircular, 10)).equal(4)
		})

		it('linear join(5..6,1..2) is 4', function() {
			let location1 = new Location(new LocationPoint(5), new LocationPoint(6)),
				location2 = new Location(new LocationPoint(1), new LocationPoint(2)),
				x = new JoinLocation([location1, location2])

			expect(x.length(notCircular, 10)).equal(4)
		})

		it('circular join(8..1) length 10 returns 4', function() {
			let location = new Location(new LocationPoint(8), new LocationPoint(1)),
				x = new JoinLocation([location])

			expect(x.length(circular, 10)).equal(4)
		})
	})

	describe('strand', function() {
		it('always returns +', function() {
			let location = new Location(new LocationPoint(1), new LocationPoint(3)),
				x = new JoinLocation([location])

			expect(x.strand()).equal('+')
		})
	})

	describe('transcriptFrom', function() {
		let seq = new Seq('ATCGNXATCG'),
		//                 |   |    |
		//                 1   5    10
			circularSeq = new Seq(seq.sequence()).setCircular()

		describe('linear sequence', function() {
			it('1..3', function() {
				let location = new Location(new LocationPoint(1), new LocationPoint(3)),
					x = new JoinLocation([location]),
					result = x.transcriptFrom(seq)

				expect(result).instanceof(Seq)
				expect(result.sequence()).equal('ATC')
			})

			it('1..3,8..10', function() {
				let location1 = new Location(new LocationPoint(1), new LocationPoint(3)),
					location2 = new Location(new LocationPoint(8), new LocationPoint(10)),
					x = new JoinLocation([location1, location2]),
					result = x.transcriptFrom(seq)

				expect(result.sequence()).equal('ATCTCG')
			})

			it('1..2,complement(4..5),8..10', function() {
				let location1 = new Location(new LocationPoint(1), new LocationPoint(2)),
					location2 = new ComplementLocation(new Location(new LocationPoint(4), new LocationPoint(5))),
					location3 = new Location(new LocationPoint(8), new LocationPoint(10)),
					x = new JoinLocation([location1, location2, location3]),
					result = x.transcriptFrom(seq)

				expect(result.sequence()).equal('ATNCTCG')
			})

			it('(overlap) 1..3,2..4', function() {
				let location1 = new Location(new LocationPoint(1), new LocationPoint(3)),
					location2 = new Location(new LocationPoint(2), new LocationPoint(4)),
					x = new JoinLocation([location1, location2]),
					result = x.transcriptFrom(seq)

				expect(result.sequence()).equal('ATCTCG')
			})
		})

		describe('circular sequence', function() {
			it('complement(9..1),4..6', function() {
				let location1 = new ComplementLocation(new Location(new LocationPoint(9), new LocationPoint(1))),
					location2 = new Location(new LocationPoint(4), new LocationPoint(6)),
					x = new JoinLocation([location1, location2]),
					result = x.transcriptFrom(circularSeq)

				expect(result.sequence()).equal('TCGGNX')
			})
		})
	})
})
