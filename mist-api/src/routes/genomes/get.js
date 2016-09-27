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

module.exports.har = {}
