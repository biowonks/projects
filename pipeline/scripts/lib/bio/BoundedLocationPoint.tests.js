/* eslint-disable no-magic-numbers, no-undefined, no-new */

'use strict'

let BoundedLocationPoint = require('./BoundedLocationPoint')

describe('BoundedLocationPoint', function() {
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
			it(`1..${nonNumber} throws error`, function() {
				expect(function() {
					new BoundedLocationPoint(1, nonNumber)
				}).throw(Error)
			})
		})

		it('0 for the stop argument throws error', function() {
			expect(function() {
				new BoundedLocationPoint(-1, 0)
			}).throw(Error)
		})

		it('start === stop throws error', function() {
			expect(function() {
				new BoundedLocationPoint(1, 1)
			}).throw(Error)
		})

		it('start > stop throws error', function() {
			expect(function() {
				new BoundedLocationPoint(2, 1)
			}).throw(Error)
		})

		it('10..11 works', function() {
			let x = new BoundedLocationPoint(10, 11)
			expect(x.lowerBound()).equal(10)
		})

		it('10..12 works', function() {
			let x = new BoundedLocationPoint(10, 12)
			expect(x.lowerBound()).equal(10)
		})

		it('-5..-2 works', function() {
			let x = new BoundedLocationPoint(-5, -2)
			expect(x.lowerBound()).equal(-5)
		})
	})

	describe('upperBound', function() {
		it('10..12 returns 12', function() {
			let x = new BoundedLocationPoint(10, 12)
			expect(x.upperBound()).equal(12)
		})
	})
})
