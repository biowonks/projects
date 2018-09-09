'use strict'

/**
 * Converts applicable query object parameters into a criteria object suitable for use with the
 * sequelize to find a single object (and potentially associated resources). The resulting criteria
 * object is assigned to res.locals for downstream use. Also validates the parsed criteria with
 * respect to a given root model. Exits the routing chain prematurely if any errors are encountered.
 *
 * @param {Object} app
 * @param {Object} middlewares
 * @returns {Function}
 */
module.exports = function(app, middlewares) {
	const criteriaService = app.get('services').criteria
	const CriteriaError = app.get('errors').CriteriaError

	return (primaryModel, accessibleModels) => {
		return function parseCriteria(req, res, next) {
			const criteria = criteriaService.createFromQueryObject(primaryModel, req.query)
			const errors = criteriaService.findErrors(criteria, primaryModel, accessibleModels)
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
