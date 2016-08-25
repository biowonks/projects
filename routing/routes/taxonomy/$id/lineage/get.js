'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let	taxonomyService = app.get('services').taxonomy

	return [
		(req, res, next) => {
			// TODO: do not call private method on the taxonomy service. Make a new function
			// that returns the desired output.
			taxonomyService.fetchLocal_(req.params.id)
			.then((result) => {
				res.json(result)
			})
		}
	]
}
