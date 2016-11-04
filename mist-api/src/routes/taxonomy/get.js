'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Taxonomy)

	return [
		middlewares.parseCriteriaForMany(models.Taxonomy),
		helper.findManyHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Taxonomies',
		description: 'Returns an array of taxonomic nodes',
		example: {
			response: {
				body: [
					modelExamples.Taxonomy
				]
			}
		}
	}
}
