'use strict'

// Local
const searchUtil = require('lib/util')

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome)

	const taxonomyTextFieldNames = [
		'superkingdom',
		'phylum',
		'class',
		'order',
		'family',
		'genus',
		'assembly_level',
	]

	const version = 'version'

	return [
		middlewares.parseCriteriaForMany(models.Genome, {
			accessibleModels: [
				models.WorkerModule,
				models.Component
			],
			permittedWhereFields: [
				'taxonomy_id',
				'id',
				...taxonomyTextFieldNames,
			],
		}),
		(req, res, next) => {
			// Provide for searching against name
			if (Reflect.has(req.query, 'search'))
				searchUtil.processSearch(req.query.search, res.locals, models.Genome.name, [...taxonomyTextFieldNames, 'name'], [version])
			// Handle searching taxonomy and assembly_level
			searchUtil.processWhereTextCondition(req.query.search, taxonomyTextFieldNames)

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
