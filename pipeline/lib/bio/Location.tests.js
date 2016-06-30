/* eslint-disable no-magic-numbers, no-new, no-unused-expressions */
'use strict'

// Local
const Location = require('./Location'),
	LocationPoint = require('./LocationPoint'),
	BetweenLocationPoint = require('./BetweenLocationPoint'),
	BoundedLocationPoint = require('./BoundedLocationPoint'),
	FuzzyLocationPoint = require('./FuzzyLocationPoint'),
	Seq = require('./Seq')

describe('Location', function() {
	describe('constructor', function() {
		it('throws with no arguments', function() {
			expect(function() {
				new Location()
			}).throw(Error)
		})

		it('throws with only start location point', function() {
			expect(function() {
				new Location(new LocationPoint(5))
			}).throw(Error)
		})

		it('throws with only stop location point', function() {
			expect(function() {
				new Location(null, new LocationPoint(5))
			}).throw(Error)
		})

		it('different location points', function() {
			new Location(new LocationPoint(1), new LocationPoint(5))
		})

		it('same location point reference', function() {
			let lp = new LocationPoint(1)
			new Location(lp, lp)
		})
	})

	describe('accession', function() {
		it('has null accession by default', function() {
			let lp = new LocationPoint(5),
				x = new Location(lp, lp)

			expect(x.accession()).null
		})

		it('returns accession defined in constructor', function() {
			let lp = new LocationPoint(5),
				x = new Location(lp, lp, 'ABC123.1')

			expect(x.accession()).equal('ABC123.1')
		})
	})

	describe('lowerBound', function() {
		it('returns the start location points lower bound', function() {
			let lp1 = new LocationPoint(5),
				lp2 = new LocationPoint(10),
				x = new Location(lp1, lp2)

			expect(x.lowerBound()).equal(lp1.lowerBound())
		})
	})

	describe('upperBound', function() {
		it('returns the stop location points upper bound', function() {
			let lp1 = new LocationPoint(5),
				lp2 = new LocationPoint(10),
				x = new Location(lp1, lp2)

			expect(x.upperBound()).equal(lp2.upperBound())
		})
	})

	describe('strand', function() {
		it('always returns +', function() {
			let lp = new LocationPoint(5),
				x = new Location(lp, lp)

			expect(x.strand()).equal('+')
		})
	})

	describe('transcriptFrom', function() {
		// ------------------------------------------------
		// Helper functions
		function locationFromString(locationString) {
			let parts = locationString.split('..')
			return new Location(locationPointFromString(parts[0]), locationPointFromString(parts[1]))
		}

		function locationPointFromString(locationPointString) {
			if (/^-?\d*$/.test(locationPointString))
				return new LocationPoint(parseInt(locationPointString))

			if (/\^/.test(locationPointString)) {
				let parts = locationPointString.split('^')
				return new BetweenLocationPoint(parseInt(parts[0]), parseInt(parts[1]))
			}

			if (/\./.test(locationPointString)) {
				let parts = locationPointString.split('.')
				return new BoundedLocationPoint(parseInt(parts[0]), parseInt(parts[1]))
			}

			if (locationPointString[0] === '<' || locationPointString[0] === '>')
				return new FuzzyLocationPoint(locationPointString[0], parseInt(locationPointString.substr(1)))

			throw new Error(`Unexpected location point string: ${locationPointString}`)
		}

		it('with external acession throws Error', function() {
			let seq = new Seq('ATG'),
				x = new Location(new LocationPoint(1), new LocationPoint(3), 'ABC123.1')

			expect(function() {
				x.transcriptFrom(seq)
			}).throw(Error)
		})

		describe('linear sequence', function() {
			let seq = new Seq('ABCDEFGHIJ')
			//                 |   |    |
			//                 1   5    10

			it('throws error with string', function() {
				expect(function() {
					let x = new Location(new LocationPoint(1), new LocationPoint(5))
					x.transcriptFrom('ATCGATGC')
				}).throw(Error)
			})

			it('>1..5 throws error', function() {
				expect(function() {
					let x = new Location(new FuzzyLocationPoint('>', 1), new LocationPoint(5))
					x.transcriptFrom(new Seq('ATCGATGC'))
				}).throw(Error)
			})

			it('2..<5 throws error', function() {
				expect(function() {
					let x = new Location(new LocationPoint(2), new FuzzyLocationPoint('<', 5))
					x.transcriptFrom(new Seq('ATCGATGC'))
				}).throw(Error)
			})

			it('>1..<2 throws error', function() {
				expect(function() {
					let x = new Location(new FuzzyLocationPoint('>', 1), new FuzzyLocationPoint('<', 2))
					x.transcriptFrom(new Seq('ATCGATGC'))
				}).throw(Error)
			})

			let examples = [
				['5..5', 'E'],
				['5..6', 'EF'],
				['5..7^8', 'EFGH'],
				['4^5..7', 'DEFG'],
				['4^5..7^8', 'DEFGH'],
				['1.3..5', 'ABCDE'],
				['2..4.6', 'BCDEF'],
				['<1..2', 'AB'],
				['1..>2', 'AB'],
				['<1..>2', 'AB']
			]

			examples.forEach((example) => {
				let locationString = example[0],
					expectedSequence = example[1]

				it(locationString, function() {
					let x = locationFromString(locationString),
						result = x.transcriptFrom(seq)
					expect(result).ok
					expect(result).instanceof(Seq)
					expect(result !== seq)
					expect(result.sequence()).equal(expectedSequence)
				})
			})
		})

		describe('circular sequence', function() {
			let seq = new Seq('ABCDEFGHIJ')
			//                 |   |    |
			//                 1   5    10
			seq.setCircular()

			let examples = [
				['10..1', 'JA'],
				['5..4', 'EFGHIJABCD']
			]

			examples.forEach((example) => {
				let locationString = example[0],
					expectedSequence = example[1]

				it(locationString, function() {
					let x = locationFromString(locationString),
						result = x.transcriptFrom(seq)
					expect(result).ok
					expect(result).instanceof(Seq)
					expect(result !== seq)
					expect(result.sequence()).equal(expectedSequence)
				})
			})
		})
	})
})
