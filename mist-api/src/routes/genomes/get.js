'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome)

	return [
		middlewares.parseCriteriaForMany(models.Genome, [
			models.WorkerModule,
			models.Component
		]),
		helper.findManyHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Genomes',
		description: 'Returns an array of genomes',
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
