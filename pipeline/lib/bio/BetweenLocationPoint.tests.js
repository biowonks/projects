/* eslint-disable no-magic-numbers, no-undefined, no-new */

'use strict'

// Local
const BetweenLocationPoint = require('./BetweenLocationPoint')

describe('BetweenLocationPoint', function() {
	describe('constructor', function() {
		let nonNumbers = [
			undefined,
			null,
			'1',
			'a',
			'',
			' ',
			[],
			{}
		]

		nonNumbers.forEach((nonNumber) => {
			it(`${nonNumber}..1 throws error`, function() {
				expect(function() {
					new BetweenLocationPoint(nonNumber, 1)
				}).throw(Error)
			})

			it(`1..${nonNumber} throws error`, function() {
				expect(function() {
					new BetweenLocationPoint(1, nonNumber)
				}).throw(Error)
			})

			it(`${nonNumber}..${nonNumber} throws error`, function() {
				expect(function() {
					new BetweenLocationPoint(nonNumber, nonNumber)
				}).throw(Error)
			})
		})

		let invalidRanges = [
			[1, 1],
			[1, 3],
			[2, 1]
		]

		invalidRanges.forEach((invalidRange) => {
			let start = invalidRange[0],
				stop = invalidRange[1]
			it(`${start}..${stop} throws error`, function() {
				expect(function() {
					new BetweenLocationPoint(start, stop)
				}).throw(Error)
			})
		})

		it('1..2', function() {
			let x = new BetweenLocationPoint(1, 2)
			expect(x.lowerBound()).equal(1)
		})
	})

	describe('upperBound', function() {
		it('10..11 should return 11', function() {
			let x = new BetweenLocationPoint(10, 11)
			expect(x.upperBound()).equal(11)
		})
	})
})
