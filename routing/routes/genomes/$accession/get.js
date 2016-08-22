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
