'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let helper = app.get('lib').RouteHelper.get(app.get('models').Genome)
	return helper.findAllHandler()
}
