'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Taxonomy)

	return [
		middlewares.parseCriteriaForMany(models.Taxonomy),
		helper.findManyHandler()
	]
}
