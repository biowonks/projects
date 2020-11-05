/* eslint-disable no-magic-numbers, no-new, no-unused-expressions */
'use strict'

// Local
const Location = require('./Location')
const ComplementLocation = require('./ComplementLocation')
const JoinLocation = require('./JoinLocation')
const LocationPoint = require('./LocationPoint')
const BetweenLocationPoint = require('./BetweenLocationPoint')
const BoundedLocationPoint = require('./BoundedLocationPoint')
const FuzzyLocationPoint = require('./FuzzyLocationPoint')
const Seq = require('core-lib/bio/Seq')

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
			const lp = new LocationPoint(1)
			new Location(lp, lp)
		})
	})

	describe('accession', function() {
		it('has null accession by default', function() {
			const lp = new LocationPoint(5)
			const x = new Location(lp, lp)

			expect(x.accession()).null
		})

		it('returns accession defined in constructor', function() {
			const lp = new LocationPoint(5)
			const x = new Location(lp, lp, 'ABC123.1')

			expect(x.accession()).equal('ABC123.1')
		})
	})

	describe('length', function() {
		describe('linear sequences', function() {
			const notCircular = false
			const lp1 = new LocationPoint(5)
			const lp2 = new LocationPoint(10)
			const x = new Location(lp1, lp2)

			it('throws error if lower bound is > sequence length', function() {
				expect(function() {
					x.length(notCircular, 5 - 1)
				}).throw(Error)
			})

			it('throws error if upper bound is > sequence length', function() {
				expect(function() {
					x.length(notCircular, 10 - 1)
				}).throw(Error)
			})

			it('5..10 returns 6', function() {
				expect(x.length(notCircular, 10)).equal(10 - 5 + 1)
			})
		})

		describe('circular sequences', function() {
			const circular = true
			const lp1 = new LocationPoint(5)
			const lp2 = new LocationPoint(8)
			const x = new Location(lp1, lp2)

			it('throws error if lower bound is > sequence length', function() {
				expect(function() {
					x.length(circular, 5 - 1)
				}).throw(Error)
			})

			it('throws error if upper bound is > sequence length', function() {
				expect(function() {
					x.length(circular, 8 - 1)
				}).throw(Error)
			})

			it('5..8 (length: 10) returns 4', function() {
				expect(x.length(circular, 10)).equal(8 - 5 + 1)
			})

			it('8..1 (length 8) returns 2', function() {
				const y = new Location(new LocationPoint(8), new LocationPoint(1))
				expect(y.length(circular, 8)).equal(2)
			})
		})
	})

	describe('lowerBound', function() {
		it('returns the start location points lower bound', function() {
			const lp1 = new LocationPoint(5)
			const lp2 = new LocationPoint(10)
			const x = new Location(lp1, lp2)

			expect(x.lowerBound()).equal(lp1.lowerBound())
		})
	})

	describe('upperBound', function() {
		it('returns the stop location points upper bound', function() {
			const lp1 = new LocationPoint(5)
			const lp2 = new LocationPoint(10)
			const x = new Location(lp1, lp2)

			expect(x.upperBound()).equal(lp2.upperBound())
		})
	})

	describe('strand', function() {
		it('always returns +', function() {
			const lp = new LocationPoint(5)
			const x = new Location(lp, lp)

			expect(x.strand()).equal('+')
		})
	})

	describe('transcriptFrom', function() {
		// ------------------------------------------------
		// Helper functions
		function locationFromString(locationString) {
			const parts = locationString.split('..')
			return new Location(locationPointFromString(parts[0]), locationPointFromString(parts[1]))
		}

		function locationPointFromString(locationPointString) {
			if (/^-?\d*$/.test(locationPointString))
				return new LocationPoint(parseInt(locationPointString))

			if (/\^/.test(locationPointString)) {
				const parts = locationPointString.split('^')
				return new BetweenLocationPoint(parseInt(parts[0]), parseInt(parts[1]))
			}

			if (/\./.test(locationPointString)) {
				const parts = locationPointString.split('.')
				return new BoundedLocationPoint(parseInt(parts[0]), parseInt(parts[1]))
			}

			if (locationPointString[0] === '<' || locationPointString[0] === '>')
				return new FuzzyLocationPoint(locationPointString[0], parseInt(locationPointString.substr(1)))

			throw new Error(`Unexpected location point string: ${locationPointString}`)
		}

		it('with external acession throws Error', function() {
			const seq = new Seq('ATG')
			const x = new Location(new LocationPoint(1), new LocationPoint(3), 'ABC123.1')

			expect(function() {
				x.transcriptFrom(seq)
			}).throw(Error)
		})

		describe('linear sequence', function() {
			const seq = new Seq('ABCDEFGHIJ')
			//                   |   |    |
			//                   1   5    10

			it('throws error with string', function() {
				expect(function() {
					const x = new Location(new LocationPoint(1), new LocationPoint(5))
					x.transcriptFrom('ATCGATGC')
				}).throw(Error)
			})

			it('>1..5 throws error', function() {
				expect(function() {
					const x = new Location(new FuzzyLocationPoint('>', 1), new LocationPoint(5))
					x.transcriptFrom(new Seq('ATCGATGC'))
				}).throw(Error)
			})

			it('2..<5 throws error', function() {
				expect(function() {
					const x = new Location(new LocationPoint(2), new FuzzyLocationPoint('<', 5))
					x.transcriptFrom(new Seq('ATCGATGC'))
				}).throw(Error)
			})

			it('>1..<2 throws error', function() {
				expect(function() {
					const x = new Location(new FuzzyLocationPoint('>', 1), new FuzzyLocationPoint('<', 2))
					x.transcriptFrom(new Seq('ATCGATGC'))
				}).throw(Error)
			})

			const examples = [
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
				const locationString = example[0]
				const expectedSequence = example[1]

				it(locationString, function() {
					const x = locationFromString(locationString)
					const result = x.transcriptFrom(seq)
					expect(result).ok
					expect(result).instanceof(Seq)
					expect(result !== seq)
					expect(result.sequence()).equal(expectedSequence)
				})
			})
		})

		describe('circular sequence', function() {
			const seq = new Seq('ABCDEFGHIJ')
			//                   |   |    |
			//                   1   5    10
			seq.setCircular()

			const examples = [
				['10..1', 'JA'],
				['5..4', 'EFGHIJABCD'],
				['<10..2', 'JAB'],
			]

			examples.forEach((example) => {
				const locationString = example[0]
				const expectedSequence = example[1]

				it(locationString, function() {
					const x = locationFromString(locationString)
					const result = x.transcriptFrom(seq)
					expect(result).ok
					expect(result).instanceof(Seq)
					expect(result !== seq)
					expect(result.sequence()).equal(expectedSequence)
				})
			})
		})
	})
})
