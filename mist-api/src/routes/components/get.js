'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Component)

	return [
		middlewares.parseCriteriaForMany(models.Component, {
			accessibleModels: [
				models.Genome,
				models.WorkerModule
			]
		}),
		helper.findManyHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Components',
		description: 'Returns an array of components (replicons / contigs). Note this does not include the associated DNA.',
		example: {
			response: {
				body: [
					modelExamples.Component
				]
			}
		}
	}
}
