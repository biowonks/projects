/* eslint-disable no-magic-numbers, no-undefined, no-unused-expressions */
'use strict'

// Local
const CriteriaService = require('./CriteriaService'),
	MistBootService = require('mist-lib/services/MistBootService')

// Other
let bootService = new MistBootService(),
	sequelize = bootService.setupSequelize(),
	Sequelize = sequelize.Sequelize,
	User = sequelize.define('User', {
		name: {
			type: Sequelize.TEXT
		},
		num_logins: {
			type: Sequelize.INTEGER
		},
		secret: {
			type: Sequelize.TEXT
		}
	}, {
		classMethods: {
			$excludedFromCriteria: function() {
				return new Set(['secret'])
			},
			$criteriaAttributes: function() {
				return ['id', 'name', 'num_logins']
			}
		}
	}),
	Profile = sequelize.define('Profile', {
		user_id: {
			type: Sequelize.INTEGER
		},
		street: {
			type: Sequelize.TEXT
		}
	}),
	Post = sequelize.define('Post', {
		user_id: {
			type: Sequelize.INTEGER
		},
		title: {
			type: Sequelize.TEXT
		}
	}),
	Account = sequelize.define('Account', {
		description: {
			type: Sequelize.TEXT
		}
	}),
	models = {
		User,
		Profile,
		Post
	}

	// TODO: handle belongsToMany
	// Tags = sequelize.define('Tag', {
	// 	label: {
	// 		type: Sequelize.TEXT
	// 	}
	// })

User.hasOne(Profile)
Profile.belongsTo(User)

User.hasMany(Post)
Post.belongsTo(User)

describe('services', function() {
	describe('CriteriaService', function() {
		describe('defaultPerPage', function() {
			it('setting to default + 10 works', function() {
				let newDefaultPerPage = CriteriaService.kDefaults.perPage + 10,
					x = new CriteriaService(models, {defaultPerPage: newDefaultPerPage})

				expect(x.defaultPerPage()).equal(newDefaultPerPage)
			})

			it('setting to default + 10 (string) works', function() {
				let newDefaultPerPage = CriteriaService.kDefaults.perPage + 10,
					x = new CriteriaService(models, {defaultPerPage: newDefaultPerPage.toString()})

				expect(x.defaultPerPage()).equal(newDefaultPerPage)
			})

			it('defaultPerPage set to maxPerPage if both are defined and is > maxPerPage', function() {
				let newDefaultPerPage = CriteriaService.kDefaults.maxPerPage + 1,
					x = new CriteriaService(models, {defaultPerPage: newDefaultPerPage})

				expect(x.defaultPerPage()).equal(CriteriaService.kDefaults.maxPerPage)
			})
		})

		describe('maxPerPage', function() {
			it('setting to default maxPerPage + 10 works', function() {
				let newMaxPerPage = CriteriaService.kDefaults.maxPerPage + 10,
					x = new CriteriaService(models, {maxPerPage: newMaxPerPage})

				expect(x.maxPerPage()).equal(newMaxPerPage)
			})

			it('setting to default maxPerPage + 10 (string) works', function() {
				let newMaxPerPage = CriteriaService.kDefaults.maxPerPage + 10,
					x = new CriteriaService(models, {maxPerPage: newMaxPerPage.toString()})

				expect(x.maxPerPage()).equal(newMaxPerPage)
			})
		})

		describe('maxPage', function() {
			it('setting to default maxPage + 10 works', function() {
				let newMaxPage = CriteriaService.kDefaults.maxPage + 10,
					x = new CriteriaService(models, {maxPage: newMaxPage})

				expect(x.maxPage()).equal(newMaxPage)
			})

			it('setting to default maxPerPage + 10 (string) works', function() {
				let newMaxPage = CriteriaService.kDefaults.maxPage + 10,
					x = new CriteriaService(models, {maxPage: newMaxPage.toString()})

				expect(x.maxPage()).equal(newMaxPage)
			})
		})

		describe('createFromQueryObject', function() {
			let service = null,
				queryObject = null,
				defaultPerPage = 10,
				maxPerPage = 20,
				maxPage = 50
			beforeEach(() => {
				queryObject = {}
				service = new CriteriaService(models, {
					defaultPerPage,
					maxPerPage,
					maxPage
				})
			})
			afterEach(() => {
				service = null
			})

			it('throws error if no primary model', function() {
				expect(function() {
					service.createFromQueryObject(null)
				}).throw(Error)
			})

			it('throws error if attempting to access non-existent model', function() {
				expect(function() {
					queryObject['fields.BadModel'] = null
					service.createFromQueryObject(User, queryObject)
				}).throw(Error)
			})

			it('throws error if model is not related', function() {
				expect(function() {
					queryObject['fields.Account'] = null
					service.createFromQueryObject(User, queryObject)
				}).throw(Error)
			})

			it('throws error if model is not part of models supplied to constructor', function() {
				expect(function() {
					service.createFromQueryObject(Account)
				})
			})

			it('defaults as expected', function() {
				let x = service.createFromQueryObject(Profile)
				expect(x).eql({
					where: null,
					attributes: null,
					include: [],
					limit: 1,
					offset: null,
					order: null
				})
			})

			it('User defaults as expected', function() {
				let x = service.createFromQueryObject(User)
				expect(x).eql({
					where: null,
					attributes: ['id', 'name', 'num_logins'],
					include: [],
					limit: 1,
					offset: null,
					order: null
				})
			})

			it('order is ignored', function() {
				let x = service.createFromQueryObject(User, {
					order: 'name'
				})
				expect(x.order).null
			})

			describe('fields parameter', function() {
				it('CSV list of all profile attributes', function() {
					queryObject.fields = 'id,user_id,street'
					let x = service.createFromQueryObject(Profile, queryObject)
					expect(x.attributes).eql([
						'id',
						'user_id',
						'street'
					])
				})

				it('subset of profile attributes', function() {
					queryObject.fields = 'street'
					let x = service.createFromQueryObject(Profile, queryObject)
					expect(x.attributes).eql([
						'street'
					])
				})

				it('null returns all attributes by setting its value to null', function() {
					queryObject.fields = null
					let x = service.createFromQueryObject(Profile, queryObject)
					expect(x.attributes).null
				})

				it('"true" returns all attributes by setting its value to null', function() {
					queryObject.fields = 'true'
					let x = service.createFromQueryObject(Profile, queryObject)
					expect(x.attributes).null
				})

				it('"false" returns no attributes', function() {
					queryObject.fields = 'false'
					let x = service.createFromQueryObject(Profile, queryObject)
					expect(x.attributes).eql([])
				})

				it('boolean throws error', function() {
					let bools = [true, false]
					bools.forEach((bool) => {
						queryObject.fields = bool
						expect(function() {
							service.createFromQueryObject(Profile, queryObject)
						}).throw(Error)
					})
				})

				it('returns list of accessible attributes if model contains excluded attribute', function() {
					let x = service.createFromQueryObject(User, {})
					expect(x.attributes).eql(['id', 'name', 'num_logins'])
				})

				// Errors are captured elsewheres via findErrors
				it('does not throw error if specifying excluded attribute', function() {
					queryObject.fields = 'secret'
					let x = service.createFromQueryObject(User, queryObject)
					expect(x.attributes).eql(['secret'])
				})

				function modelsToNames(criteria) {
					criteria.include.forEach((include) => {
						if (include.model)
							include.model = include.model.name

						modelsToNames(include)
					})

					return criteria
				}

				it('select both user and profile attributes', function() {
					queryObject['fields.Profile'] = null
					let x = modelsToNames(service.createFromQueryObject(User, queryObject))
					expect(x.attributes).eql(['id', 'name', 'num_logins'])
					expect(x.include).eql([
						{
							model: 'Profile',
							include: []
						}
					])
				})

				it('select fields for User, Profile, and Post', function() {
					queryObject['fields.Profile'] = null
					queryObject['fields.Post'] = 'title'
					let x = modelsToNames(service.createFromQueryObject(User, queryObject))
					expect(x.attributes).eql(['id', 'name', 'num_logins'])
					expect(x.include).eql([
						{
							model: 'Profile',
							include: []
						},
						{
							model: 'Post',
							attributes: ['title'],
							include: []
						}
					])
				})

				it('select specific field for User, none for Profile, and all for Post', function() {
					queryObject.fields = 'num_logins,id'
					queryObject['fields.Profile'] = 'false'
					queryObject['fields.Post'] = 'true'
					let x = modelsToNames(service.createFromQueryObject(User, queryObject))
					expect(x.attributes).eql(['num_logins', 'id'])
					expect(x.include).eql([
						{
							model: 'Profile',
							attributes: [],
							include: []
						},
						{
							model: 'Post',
							include: []
						}
					])
				})
			})
		})

		describe('createFromQueryObjectForMany', function() {
			let service = null,
				queryObject = null,
				defaultPerPage = 10,
				maxPerPage = 20,
				maxPage = 50
			beforeEach(() => {
				queryObject = {}
				service = new CriteriaService(models, {
					defaultPerPage,
					maxPerPage,
					maxPage
				})
			})
			afterEach(() => {
				service = null
			})

			it('defaults values as expected', function() {
				let x = service.createFromQueryObjectForMany(Profile)
				expect(x).eql({
					where: null,
					attributes: null,
					include: [],
					limit: service.defaultPerPage(),
					offset: null,
					order: [
						['id']
					]
				})
			})

			describe('order parameter', function() {
				it('User.name ascending: order=name', function() {
					queryObject.order = 'name'
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.order).eql([['name']])
				})

				it('User.name descending: order=-name', function() {
					queryObject.order = '-name'
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.order).eql([['name', 'desc']])
				})

				it('User.name and User.num_logins: order=-name,num_logins', function() {
					queryObject.order = '-name,num_logins'
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.order).eql([
						['name', 'desc'],
						['num_logins']
					])
				})

				it('User.invalid_field does not throw error: order=invalid_field', function() {
					queryObject.order = 'invalid_field'
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.order).eql([['invalid_field']])
				})
			})

			describe('per_page parameter', function() {
				it('null returns default limit', function() {
					queryObject.per_page = null
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.limit).equal(service.defaultPerPage())
				})

				it('"" returns default limit', function() {
					queryObject.per_page = ''
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.limit).equal(service.defaultPerPage())
				})

				it('"abc" throws error', function() {
					expect(function() {
						queryObject.per_page = 'abc'
						service.createFromQueryObjectForMany(User, queryObject)
					}).throw(Error)
				})

				it('-1 throws error', function() {
					expect(function() {
						queryObject.per_page = -1
						service.createFromQueryObjectForMany(User, queryObject)
					}).throw(Error)
				})

				let perPageValues = [0, '0', 1, '1', 5, '5', maxPerPage, maxPerPage + 1]
				perPageValues.forEach((perPage) => {
					let expectedLimit = Math.min(Number(perPage), maxPerPage)
					it(`per_page=${perPage} (${typeof perPage}) should set limit of ${expectedLimit}`, function() {
						queryObject.per_page = perPage
						let x = service.createFromQueryObjectForMany(User, queryObject)
						expect(x.limit).equal(expectedLimit)
					})
				})

				it('override defaultPerPage via options', function() {
					let x = service.createFromQueryObjectForMany(User, {}, {defaultPerPage: defaultPerPage + 5})
					expect(x.limit).equal(defaultPerPage + 5)
				})

				it('override defaultPerPage; query per_page is capped to override default', function() {
					queryObject.per_page = defaultPerPage + 10
					let x = service.createFromQueryObjectForMany(User, {}, {defaultPerPage: defaultPerPage + 5})
					expect(x.limit).equal(defaultPerPage + 5)
				})

				it('override defaultPerPage and maxPerPage', function() {
					let x = service.createFromQueryObjectForMany(User, {}, {
						defaultPerPage: defaultPerPage + 5,
						maxPerPage: 1
					})
					expect(x.limit).equal(1)

					x = service.createFromQueryObjectForMany(User, {}, {
						defaultPerPage: defaultPerPage + 5,
						maxPerPage: 0
					})
					expect(x.limit).equal(0)
				})

				it('override defaultPerPage and maxPerPage with null', function() {
					queryObject.per_page = maxPerPage + 1
					let x = service.createFromQueryObjectForMany(User, queryObject, {
						defaultPerPage: null,
						maxPerPage: null
					})
					expect(x.limit).equal(maxPerPage)
				})
			})

			describe('page parameter', function() {
				it('null uses no offset', function() {
					queryObject.page = null
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.offset).null
				})

				it('"" uses no offset', function() {
					queryObject.page = ''
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.offset).null
				})

				it('"abc" throws error', function() {
					expect(function() {
						queryObject.page = 'abc'
						service.createFromQueryObjectForMany(User, queryObject)
					}).throw(Error)
				})

				it('0 throws error', function() {
					expect(function() {
						queryObject.page = 0
						service.createFromQueryObjectForMany(User, queryObject)
					}).throw(Error)
				})

				let pageValues = [1, '1', 5, '5']
				pageValues.forEach((page) => {
					expect(page).at.most(maxPage)

					let expectedOffset = null
					if (Number(page) > 1)
						expectedOffset = (Number(page) - 1) * defaultPerPage

					it(`page=${page} (${typeof page}) should set offset of ${expectedOffset}`, function() {
						queryObject.page = page
						let x = service.createFromQueryObjectForMany(User, queryObject)
						expect(x.offset).equal(expectedOffset)
					})
				})

				it('any pages over the max page returns offset of last page', function() {
					queryObject.page = maxPage + 1
					let x = service.createFromQueryObjectForMany(User, queryObject)
					expect(x.offset).equal((maxPage * defaultPerPage) - defaultPerPage)
				})

				it('override maxPage', function() {
					queryObject.page = maxPage + 2
					let x = service.createFromQueryObjectForMany(User, queryObject, {maxPage: maxPage + 1})
					expect(x.offset).equal(((maxPage + 1) * defaultPerPage) - defaultPerPage)
				})

				it('override maxPage to null', function() {
					queryObject.page = maxPage + 1
					let x = service.createFromQueryObjectForMany(User, queryObject, {maxPage: null})
					expect(x.offset).equal((queryObject.page * defaultPerPage) - defaultPerPage)
				})
			})
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
				it(`${input} throws error`, function() {
					expect(function() {
						x.perPageFrom(input)
					})
				})
			})

			for (let i of [0, 1, 2, 5, 10]) {
				let y = new CriteriaService(models, {maxPerPage: 10})
				it(`${i} returns ${i}`, function() {
					expect(y.perPageFrom(i)).equal(i)
				})
			}

			it('values over max are clamped to the max', function() {
				let y = new CriteriaService(models, {maxPerPage: 10})
				expect(y.perPageFrom(11)).equal(10)
			})

			it('if default per page is greater than maximum per page, return maximum per page', function() {
				let y = new CriteriaService(models, {defaultPerPage: 20, maxPerPage: 10})
				expect(y.perPageFrom()).equal(10)
			})
		})

		describe('pageFrom', function() {
			let x = new CriteriaService(),
				defaultPageValues = [
					undefined,
					null,
					1,
					'1'
				],
				invalidPageValues = [
					1.2,
					1.5,
					1.9,
					'a',
					-1,
					-2,
					-3.5
				]

			defaultPageValues.forEach((input) => {
				it(`${input} returns 1`, function() {
					expect(x.pageFrom(input)).equal(1)
				})
			})

			invalidPageValues.forEach((input) => {
				it(`${input} throws error`, function() {
					expect(function() {
						x.pageFrom(input)
					}).throw(Error)
				})
			})

			it('5 returns 5', function() {
				expect(x.pageFrom(5)).equal(5)
			})

			it('"10" returns 10', function() {
				expect(x.pageFrom('10')).equal(10)
			})

			it('maxPage + 1 returns maxPage', function() {
				let maxPage = x.maxPage()
				expect(x.pageFrom(maxPage + 1)).equal(maxPage)
			})
		})

		describe('orderFrom', function() {
			let x = new CriteriaService()
			it('empty orderString returns primary key attributes', function() {
				expect(x.orderFrom(User)).eql([['id']])
			})

			it('empty string returns primary key attributes', function() {
				expect(x.orderFrom(User, '')).eql([['id']])
				expect(x.orderFrom(User, ',')).eql([['id']])
				expect(x.orderFrom(User, ' , , ,,')).eql([['id']])
			})

			it('single order field', function() {
				expect(x.orderFrom(User, 'id')).eql([['id']])
			})

			it('single order in desc order', function() {
				expect(x.orderFrom(User, '-name')).eql([['name', 'desc']])
			})

			it('multiple fields', function() {
				expect(x.orderFrom(User, '-name,id')).eql([['name', 'desc'], ['id']])
			})
		})

		describe('offsetFromPage', function() {
			it('returns the offset for a given 1-based page and per-page value', function() {
				let x = new CriteriaService()
				expect(x.offsetFromPage()).equal(0)
				expect(x.offsetFromPage(3)).equal(0)
				expect(x.offsetFromPage(null, 3)).equal(0)
				expect(x.offsetFromPage(1, 10)).equal(0)
				expect(x.offsetFromPage(1, 0)).equal(0)
				expect(x.offsetFromPage(0, 10)).equal(0)

				expect(x.offsetFromPage(-1, -10)).equal(0)
				expect(x.offsetFromPage(1, 1)).equal(0)
				expect(x.offsetFromPage(1, 10)).equal(0)

				expect(x.offsetFromPage(2, 0)).equal(0)

				expect(x.offsetFromPage(2, 1)).equal(1)
				expect(x.offsetFromPage(2, 2)).equal(2)

				expect(x.offsetFromPage(3, 5)).equal(10)
			})
		})

		describe('findErrors', function() {
			let service = null,
				queryObject = null,
				defaultPerPage = 10,
				maxPerPage = 20,
				maxPage = 50
			beforeEach(() => {
				queryObject = {}
				service = new CriteriaService(models, {
					defaultPerPage,
					maxPerPage,
					maxPage
				})
			})
			afterEach(() => {
				service = null
			})

			it('throws error if model is not part of models supplied to constructor', function() {
				expect(function() {
					let criteria = service.createFromQueryObject(Profile)
					expect(function() {
						service.findErrors(criteria, Account)
					}).throw(Error)
				})
			})

			it('valid criteria returns null', function() {
				let criteria = service.createFromQueryObject(User, {}),
					x = service.findErrors(criteria, User)

				expect(x).null
			})

			it('valid criteria with included model', function() {
				queryObject.fields = 'id,name'
				queryObject['fields.Post'] = 'title'
				let criteria = service.createFromQueryObject(User, queryObject),
					errors = service.findErrors(criteria, User, {
						accessibleModels: [Post]
					})

				expect(errors).null
			})

			it('check for invalid attributes, excluded attributes, and inaccessible models', function() {
				queryObject.fields = 'id,num_logins,bad_field,secret,another_bad_field'
				queryObject['fields.Profile'] = 'false'
				queryObject['fields.Post'] = 'true'
				let criteria = service.createFromQueryObject(User, queryObject),
					errors = service.findErrors(criteria, User)

				expect(errors).instanceof(Array)
				expect(errors.length).equal(3)
				errors.forEach((error) => {
					expect(error.message).a('string')
					expect(error.message.length).above(0)
				})
				errors.forEach((error) => Reflect.deleteProperty(error, 'message'))
				expect(errors).eql([
					{
						type: 'InvalidFieldError',
						fields: [
							'bad_field',
							'another_bad_field'
						],
						model: 'User'
					},
					{
						type: 'InaccessibleFieldError',
						fields: [
							'secret'
						],
						model: 'User'
					},
					{
						type: 'InaccessibleModelError',
						models: [
							'Profile',
							'Post'
						]
					}
				])
			})

			it('check for invalid attributes in related model', function() {
				queryObject['fields.Profile'] = 'missing-field'
				let criteria = service.createFromQueryObject(User, queryObject),
					errors = service.findErrors(criteria, User, {
						accessibleModels: [Profile]
					})

				expect(errors).instanceof(Array)
				expect(errors.length).equal(1)
				Reflect.deleteProperty(errors[0], 'message')
				expect(errors[0]).eql({
					type: 'InvalidFieldError',
					fields: [
						'missing-field'
					],
					model: 'Profile'
				})
			})

			it('finds invalid attributes in order field', function() {
				queryObject.order = 'invalid_field'
				let criteria = service.createFromQueryObjectForMany(User, queryObject),
					errors = service.findErrors(criteria, User)

				expect(errors.length).equal(1)
				expect(errors[0].type).equal('InvalidFieldError')
			})

			it('finds not permitted, but valid attributes in order field', function() {
				queryObject.order = 'name,num_logins'
				let criteria = service.createFromQueryObjectForMany(User, queryObject),
					errors = service.findErrors(criteria, User, {
						permittedOrderFields: ['id', 'name']
					})

				expect(errors.length).equal(1)
				expect(errors[0].type).equal('SortFieldError')
				expect(errors[0].fields).eql(['num_logins'])
			})

			it('order field, * permitted, valid field', function() {
				queryObject.order = 'name'
				let criteria = service.createFromQueryObjectForMany(User, queryObject),
					errors = service.findErrors(criteria, User, {
						permittedOrderFields: '*'
					})

				expect(errors).null
			})

			it('order field, null permitted fields, order by id works', function() {
				queryObject.order = 'id'
				let criteria = service.createFromQueryObjectForMany(User, queryObject),
					errors = service.findErrors(criteria, User, {
						permittedOrderFields: null
					})

				expect(errors).null
			})

			it('order field, empty array for permitted fields, order by id returns error', function() {
				queryObject.order = 'id'
				let criteria = service.createFromQueryObjectForMany(User, queryObject),
					errors = service.findErrors(criteria, User, {
						permittedOrderFields: []
					})

				expect(errors.length).equal(1)
				expect(errors[0].type).equal('SortFieldError')
				expect(errors[0].fields).eql(['id'])
			})
		})
	})
})
