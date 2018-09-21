'use strict'

// Local
const searchUtil = require('lib/util')

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome)

	const exactMatchFieldNames = ['version']

	const textFieldNames = [
		'superkingdom',
		'phylum',
		'class',
		'order',
		'family',
		'genus',
		'assembly_level'
	]

	return [
		middlewares.parseCriteriaForMany(models.Genome, {
			accessibleModels: [
				models.WorkerModule,
				models.Component
			],
			permittedWhereFields: [
				'taxonomy_id',
				'id',
				...textFieldNames
			],
		}),
		(req, res, next) => {
			if (Reflect.has(req.query, 'search')) {
				searchUtil.assignExactMatchCriteria(req.query.search, res.locals, exactMatchFieldNames)
				searchUtil.assignInexactMatchCriteria(req.query.search, res.locals, [...textFieldNames, 'name'])
			}
			// Handle searching taxonomy and assembly_level
			searchUtil.processWhereTextCondition(res.locals, textFieldNames)

			next()
		},
		helper.findManyHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Genomes',
		description: 'Returns an array of <a href="#genome-model">Genomes</a>.',
		method: null,
		uri: null,
		parameters: null,
		example: {
			response: {
				body: [
					modelExamples.Genome
				]
			}
		},
		har: null
	}
}
