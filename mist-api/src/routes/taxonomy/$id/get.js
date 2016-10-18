'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Taxonomy)

	return [
		middlewares.parseCriteria(models.Taxonomy),
		helper.findHandler('id')
	]
}

module.exports.docs = {
	name: 'Fetch Taxonomy Node',
	description: 'Returns the NCBI taxonomic record'
}
