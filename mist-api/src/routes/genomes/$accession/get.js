'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome)

	return [
		middlewares.parseCriteria(models.Genome, {
			accessibleModels: [
				models.WorkerModule,
				models.Component
			]
		}),
		helper.findHandler('accession', 'version')
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Genome',
		description: 'Returns a single genome',
		example: {
			request: {
				parameters: {
					accession: modelExamples.Genome.version
				}
			},
			response: {
				body: modelExamples.Genome
			}
		}
	}
}
