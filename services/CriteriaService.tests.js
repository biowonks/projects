/* eslint-disable no-magic-numbers, no-undefined */
'use strict'

// Local
const CriteriaService = require('./CriteriaService')

describe('services', function() {
	describe.only('CriteriaService', function() {
		describe('createFromQueryObject', function() {

		})

		describe('perPageFrom', function() {
			let x = new CriteriaService(),
				inputPerPageValues = [
					undefined,
					null,
					'abc',
					{},
					'',
					-1,
					-10
				]

			inputPerPageValues.forEach((input) => {
				it(`${input} returns default per page`, function() {
					expect(x.perPageFrom(input)).equal(CriteriaService.kDefaults.perPage)
				})
			})

			for (let i of [0, 1, 2, 5, 10]) {
				let y = new CriteriaService(null, {maxPerPage: 10})
				it(`${i} returns ${i}`, function() {
					expect(y.perPageFrom(i)).equal(i)
				})
			}

			it('values over max are clamped to the max', function() {
				let y = new CriteriaService(null, {maxPerPage: 10})
				expect(y.perPageFrom(11)).equal(10)
			})
		})

		describe('pageFrom', function() {
			let x = new CriteriaService(),
				inputPageValues = [
					undefined,
					null,
					1,
					1.2,
					1.5,
					1.9,
					'1',
					'a',
					-1,
					-2,
					-3.5
				]

			inputPageValues.forEach((input) => {
				it(`${input} returns 1`, function() {
					expect(x.pageFrom(input)).equal(1)
				})
			})

			it('5 returns 5', function() {
				expect(x.pageFrom(5)).equal(5)
			})

			it('"10" returns 10', function() {
				expect(x.pageFrom('10')).equal(10)
			})
		})

		describe('offsetFromPage', function() {

		})

		describe('findErrors', function() {

		})
	})
})
