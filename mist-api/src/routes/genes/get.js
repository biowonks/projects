'use strict'

// Local
const searchUtil = require('lib/util')

module.exports = function(app, middlewares, routeMiddlewares) {
	const models = app.get('models')
	const helper = app.get('lib').RouteHelper.for(models.Gene)

	const exactMatchFieldNames = [
		'version',
		'locus',
		'old_locus',
		'stable_id',
	]
	const textFieldNames = ['product']

	return [
		middlewares.parseCriteriaForMany(models.Gene, {
			accessibleModels: [
				models.Genome,
				models.Component,
				models.Aseq,
				models.Dseq,
			],
			permittedWhereFields: [
				'id',
			],
		}),
		(req, res, next) => {
			if (Reflect.has(req.query, 'search')) {
				searchUtil.assignExactMatchCriteria(req.query.search, res.locals, exactMatchFieldNames)
				searchUtil.assignPartialMatchCriteria(req.query.search, res.locals, textFieldNames)
			}

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
					modelExamples.Gene,
				],
			},
		},
	}
}
