'use strict'

const searchUtil = require('lib/util')

exports.geneFinderMiddlewares = function(app, middlewares, inputGetter) {
	const models = app.get('models')
	const helper = app.get('lib').RouteHelper.for(models.Gene)

	const exactMatchFieldNames = [
		'version',
		'locus',
		'old_locus',
		'stable_id',
	]

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
				'stable_id'
			],
		}, inputGetter),
		(req, res, next) => {
			if (Reflect.has(inputGetter(req), 'search')) {
				searchUtil.assignExactMatchCriteria(inputGetter(req).search, res.locals, exactMatchFieldNames)
				// For the time being, only exact searches across a limited amount of fields
			}
			next()
		},
		helper.findManyHandler(inputGetter)
	]
}

exports.docs = function(modelExamples) {
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
