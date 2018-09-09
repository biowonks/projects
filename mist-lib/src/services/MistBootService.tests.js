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
			let model = null
			before(() => {
				const bootService = new MistBootService()
				const models = bootService.setupModels()
				model = Object.values(models)[0]
			})

			it('$excludedFromCriteria returns null', function() {
				expect(model.$excludedFromCriteria).a('Function')
				expect(model.$excludedFromCriteria()).null
			})

			it('$criteriaAttributes returns null', function() {
				expect(model.$criteriaAttributes).a('Function')
				expect(model.$criteriaAttributes()).null
			})

			it('$idSequence returns null', function() {
				expect(model.$idSequence).a('Function')
				expect(model.$idSequence()).equal(model.name)
			})
		})
	})
})
