'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let	taxonomyService = app.get('services').taxonomy

	return [
		(req, res, next) => {
			let	immediateChildren = req.params.immediate ? false : true
			let	finalNodesOnly = req.params.finalNodesOnly ? true : false

			taxonomyService.fetchChildren(req.params.id, finalNodesOnly, immediateChildren)
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
