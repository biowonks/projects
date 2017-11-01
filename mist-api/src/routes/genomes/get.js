'use strict'

// Vendor
const _ = require('lodash')

// Local
const util = require('core-lib/util')

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome)

	return [
		middlewares.parseCriteriaForMany(models.Genome, {
			accessibleModels: [
				models.WorkerModule,
				models.Component
			],
			maxPage: null,
			permittedOrderFields: '*',
			permittedWhereFields: [
				'taxonomy_id',
			],
		}),
		// Provide for searching against name
		(req, res, next) => {
			if (Reflect.has(req.query, 'search')) {
				const searchTerms = util.splitIntoTerms(req.query.search)
					.map((term) => `%${term}%`)
				if (searchTerms.length > 0)
					_.set(res.locals, 'criteria.where.name.$iLike.$any', searchTerms)
			}
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
