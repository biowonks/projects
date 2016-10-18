'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Gene)

	return [
		middlewares.parseCriteriaForMany(models.Gene, [
			models.Component,
			models.Aseq,
			models.Dseq
		]),
		helper.findManyHandler()
	]
}

module.exports.docs = {
	name: 'Fetch Many Genes',
	description: 'Returns an array of genes'
}
