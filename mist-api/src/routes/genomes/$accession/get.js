'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome)

	return [
		middlewares.parseCriteria(models.Genome, [
			models.WorkerModule,
			models.Component
		]),
		helper.findHandler('accession')
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Genome',
		description: 'Returns a single genome',
		example: {
			request: {
				parameters: {
					accession: modelExamples.Genome.accession
				}
			},
			response: {
				body: modelExamples.Genome
			}
		}
	}
}
