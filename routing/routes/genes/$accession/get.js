'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Gene)

	return [
		middlewares.parseCriteria(models.Gene, [
			models.Component,
			models.Aseq,
			models.Dseq
		]),
		helper.findHandler('accession')
	]
}
