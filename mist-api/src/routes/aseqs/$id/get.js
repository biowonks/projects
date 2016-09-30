'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Aseq)

	return [
		middlewares.parseCriteria(models.Aseq, [
			models.Gene
		]),
		helper.findHandler()
	]
}

module.exports.docs = {
	name: 'Fetch Aseq',
	description: 'Returns an Aseq record (including predicted results)',
	parameters: [
		{
			name: 'id',
			type: 'string',
			description: 'a source-agnostic, 22-character string derived solely from the sequence characters that uniquely identifies a specific amino acid sequence'
		}
	]
}
