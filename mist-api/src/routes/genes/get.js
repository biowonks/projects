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

	const processSearch = (queryValue, target) => {
		if (!queryValue)
			return
		if (!target)
			throw new Error('processSearch must have a defined target')
		const terms = util.splitIntoTerms(queryValue).map((term) => `%${term}%`)
		if (terms.length > 0) {
			textFieldNames
			.forEach((fieldName) => {
				_.set(target, `criteria.where.$or.${fieldName}.$ilike.$any`, terms)
			})
		}
	}

	return [
		middlewares.parseCriteriaForMany(models.Gene, {
			accessibleModels: [
				models.Genome,
				models.Component,
				models.Aseq,
				models.Dseq
			],
			maxPage: null,
			permittedOrderFields: '*',
			permittedWhereFields: [
				'id',
				...textFieldNames,
			]
		}),
		(req, res, next) => {
			// Provide for searching against textFieldNames (see above)
			if (Reflect.has(req.query, 'search'))
				processSearch(req.query.search, res.locals)

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