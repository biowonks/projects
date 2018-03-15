'use strict'
// Vendor
const _ = require('lodash')

// Local
const util = require('core-lib/util')

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Gene)


	const textFieldNames = [
			'version',
			'locus',
			'old_locus',
			'stable_id',
			'product'
	]

	const checkAndGetTerms = (queryValue, target, modelFieldName) => {
		if (!queryValue)
			return

		if (!target || !modelFieldName)
			throw new Error('processWhereTextCondition must have a defined target and modelFieldName')

		return util.splitIntoTerms(queryValue).map((term) => `%${term}%`)
	}

	const processSearch = (queryValue, target) => {
		if (!queryValue)
			return
		if (!target)
			throw new Error('processSearch must have a defined target')
		const terms = util.splitIntoTerms(queryValue).map((term) => `%${term}%`)
		console.log("queryValue " + queryValue)
		if (terms.length > 0) {
			textFieldNames
			.forEach((fieldName) => {

				_.set(target, `criteria.where.$or.${fieldName}.$ilike.$any`, terms)
			})
		}
	}

	// const processWhereTextCondition = (queryValue, target, modelFieldName) => {
	// 	const terms = checkAndGetTerms(queryValue, target, modelFieldName)
	// 	if (terms.length > 0) {
	// 		_.set(target, `criteria.where.${modelFieldName}.$ilike.$any`, terms)
	// 	}
	// }

	return [
		middlewares.parseCriteriaForMany(models.Gene, {
			accessibleModels: [
				models.Genome,
				models.Component,
				models.Aseq,
				models.Dseq
			]
		}),
		(req, res, next) => {
			// Provide for searching against textFieldNames (see above)
			if (Reflect.has(req.query, 'search'))
				processSearch(req.query.search, res.locals)
			// Handle searching taxonomy
			// taxonomyTextFieldNames
			// .forEach((fieldName) => {
			// 	const queryValue = _.get(res.locals, `criteria.where.${fieldName}`)
			// 	if (queryValue)
			// 		processWhereTextCondition(queryValue, res.locals, fieldName)
			// })

			next()
		},
		helper.findManyHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Genes',
		description: 'Returns an array of genes',
		example: {
			response: {
				body: [
					modelExamples.Gene
				]
			}
		}
	}
}
