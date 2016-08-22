'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Aseq)

	return [
		middlewares.parseCriteria(models.Aseq),
		helper.findHandler()
	]
}
