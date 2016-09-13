'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let	taxonomyService = app.get('services').taxonomy

	return [
		(req, res, next) => {
			taxonomyService.fetchLineage(req.params.id)
			.then((result) => {
				res.json(result)
			})
		}
	]
}
