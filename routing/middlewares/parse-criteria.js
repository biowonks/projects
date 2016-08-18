'use strict'

/**
 * Converts applicable query object parameters into a criteria object suitable for using with
 * sequelize find methods. The resulting criteria object is assigned to res.locals for downstream
 * use. Also validates the parsed criteria with respect to a given root model. Exits the routing
 * chain prematurely if any errors are encountered.
 *
 * @param {Object} app
 * @param {Object} middlewares
 * @returns {Function}
 */
module.exports = function(app, middlewares) {
	let criteriaService = app.get('services').criteria,
		CriteriaError = app.get('errors').CriteriaError

	return (primaryModel, accessibleModels) => {
		return function parseCriteria(req, res, next) {
			let criteria = criteriaService.createFromQueryObject(primaryModel, req.query),
				errors = criteriaService.findErrors(criteria, primaryModel, accessibleModels)
			if (!errors) {
				res.locals.criteria = criteria
				next()
			}
			else {
				next(new CriteriaError('Invalid criteria', errors))
			}
		}
	}
}
