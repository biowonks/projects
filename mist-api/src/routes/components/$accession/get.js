'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Component)

	return [
		middlewares.parseCriteria(models.Component, [
			models.Genome,
			models.WorkerModule
		]),
		helper.findHandler('accession')
	]
}

module.exports.docs = {
	name: 'Fetch Component',
	description: 'Returns a single component (replicon / contig) without its associated DNA'
}
