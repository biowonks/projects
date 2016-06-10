/* eslint-disable no-magic-numbers, no-unused-expressions, no-new */

'use strict'

let FuzzyLocationPoint = require('./FuzzyLocationPoint')

describe('FuzzyLocationPoint', function() {
	describe('constructor', function() {
		it('non > or < operator argument throws error', function() {
			expect(function() {
				new FuzzyLocationPoint(null, 10)
			}).throw(Error)
		})

		it('> 10', function() {
			let x = new FuzzyLocationPoint('>', 10)
			expect(x.isExact()).false
			expect(x.lowerBound()).equal(10)
			expect(x.upperBound()).equal(10)
		})

		it('< 10', function() {
			let x = new FuzzyLocationPoint('<', 10)
			expect(x.isExact()).false
			expect(x.lowerBound()).equal(10)
			expect(x.upperBound()).equal(10)
		})
	})
})
