/* eslint-disable no-unused-expressions */
'use strict'

// Vendor
const Sequelize = require('sequelize')

// Local
const mistSequelize = require('./mist-sequelize')

describe('mist-sequelize', function() {
	it('exports Sequelize', function() {
		expect(mistSequelize.Sequelize).equal(Sequelize)
	})

	describe('empty configuration', function() {
		let x = null,
			model = null
		beforeEach(() => {
			x = mistSequelize()
			model = x.define('MockModel', {
				field: {
					type: x.Sequelize.TEXT
				}
			})
		})

		it('$excludedFromCriteria returns null', function() {
			expect(model.$excludedFromCriteria).a('Function')
			expect(model.$excludedFromCriteria()).null
		})

		it('$criteriaAttributes returns null', function() {
			expect(model.$criteriaAttributes).a('Function')
			expect(model.$criteriaAttributes()).null
		})
	})

	for (let defineProperty of ['underscored', 'timestamps']) {
		it(`setting the "${defineProperty}" sequelize parameter throws error`, function() {
			expect(function() {
				mistSequelize({
					sequelizeOptions: {
						define: {
							[defineProperty]: true
						}
					}
				})
			}).throw(Error)

			expect(function() {
				mistSequelize({
					sequelizeOptions: {
						define: {
							[defineProperty]: true
						}
					}
				})
			}).throw(Error)
		})
	}
})
