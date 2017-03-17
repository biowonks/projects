'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Component)

	return [
		middlewares.parseCriteria(models.Component, {
			accessibleModels: [
				models.Genome,
				models.WorkerModule
			]
		}),
		helper.findHandler('accession', 'version')
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Component',
		description: 'Returns a single component (replicon / contig) without its associated DNA',
		example: {
			request: {
				parameters: {
					accession: modelExamples.Component.version
				}
			},
			response: {
				body: modelExamples.Component
			}
		}
	}
}
