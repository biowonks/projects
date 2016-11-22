'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Gene)

	return [
		middlewares.parseCriteriaForMany(models.Gene, {
			accessibleModels: [
				models.Component,
				models.Aseq,
				models.Dseq
			]
		}),
		helper.findManyHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Genes',
		description: 'Returns an array of genes',
		example: {
			response: {
				body: [
					modelExamples.Gene
				]
			}
		}
	}
}
