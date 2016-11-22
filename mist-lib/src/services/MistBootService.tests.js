/* eslint-disable no-unused-expressions */
'use strict'

// Local
const MistBootService = require('./MistBootService')

describe('services', function() {
	describe('MistBootService', function() {
		it('exports Sequelize', function() {
			expect(MistBootService.Sequelize).a('Function')
		})

		describe('global class methods', function() {
			let mockModel = null
			before(() => {
				let bootService = new MistBootService(),
					sequelize = bootService.setupSequelize()

				mockModel = sequelize.define('MockModel', {
					field: {
						type: sequelize.Sequelize.TEXT
					}
				})
			})

			it('$excludedFromCriteria returns null', function() {
				expect(mockModel.$excludedFromCriteria).a('Function')
				expect(mockModel.$excludedFromCriteria()).null
			})

			it('$criteriaAttributes returns null', function() {
				expect(mockModel.$criteriaAttributes).a('Function')
				expect(mockModel.$criteriaAttributes()).null
			})

			it('$idSequence returns null', function() {
				expect(mockModel.$idSequence).a('Function')
				expect(mockModel.$idSequence()).equal('MockModel')
			})
		})
	})
})
