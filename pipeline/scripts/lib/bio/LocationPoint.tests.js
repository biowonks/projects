'use strict'

let LocationPoint = require('./LocationPoint')

describe('LocationPoint', function() {
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
			it(nonNumber + ' throws error', function() {
				expect(function() {
					new LocationPoint(nonNumber)
				}).throw(Error)
			})
		})

		it('zero throws error', function() {
			expect(function() {
				new LocationPoint(0)
			}).throw(Error)
		})
	})

	describe('isExact', function() {
		let positions = [
			-10,
			-1,
			1,
			10
		]

		positions.forEach((position) => {
			it(position + ' is exact', function() {
				let x = new LocationPoint(position)
				expect(x.isExact()).true
			})
		})
	})

	describe('lowerBound', function() {
		it('position is the lower bound', function() {
			let x = new LocationPoint(5)
			expect(x.lowerBound()).equal(5)
		})
	})

	describe('upperBound', function() {
		it('position is the upper bound', function() {
			let x = new LocationPoint(5)
			expect(x.upperBound()).equal(5)
		})
	})
})
