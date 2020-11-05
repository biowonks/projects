'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	const	taxonomyService = app.get('services').taxonomy

	return [
		(req, res, next) => {
			const options = {}
			options.isImmediate = req.query.immediate
			options.isLeafOnly = req.query.leafOnly

			taxonomyService.fetchChildren(req.params.id, options)
			.then((result) => {
				res.json(result)
			})
		}
	]
}

module.exports.docs = {
	name: 'Fetch Child Taxonomy',
	description: 'Returns an array of child taxonomic nodes'
}
