'use strict'

let Location = require('./Location'),
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

	describe('transcriptFrom (linear sequence)', function() {
		let seq = new Seq('ABCDEFGHIJ')
		//                 |   |    |
		//                 1   5    10

		it('throws error with string', function() {
			expect(function() {
				let x = new Location(new LocationPoint(1), new LocationPoint(5))
				x.transcriptFrom('ATCGATGC')
			}).throw(Error)
		})

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

			throw new Error('Unexpected location point string: ' + locationPointString)
		}

		let examples = [
			['5..5', 'E'],
			['5..7^8', 'EFGH'],
			['4^5..7', 'DEFG']
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
