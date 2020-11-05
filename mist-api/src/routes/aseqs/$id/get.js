'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	const models = app.get('models')
	const helper = app.get('lib').RouteHelper.for(models.Aseq)

	return [
		middlewares.parseCriteria(models.Aseq, {
			accessibleModels: [
				models.Gene
			]
		}),
		helper.findHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Aseq',
		description: 'Returns an Aseq record (including predicted results)',
		example: {
			request: {
				parameters: {
					id: 'eALFsiVPvD8jtNe_9Qifig'
				}
			},
			response: {
				body: modelExamples.Aseq
			}
		}
	}
}
