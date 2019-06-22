'use strict'

/**
 * Converts applicable query object parameters into a criteria object suitable for use with the
 * sequelize to find many rows (and potentially associated resources). The resulting criteria
 * object is assigned to res.locals for downstream use. Also validates the parsed criteria with
 * respect to a given root model. Exits the routing chain prematurely if any errors are encountered.
 *
 * @param {Object} app
 * @param {Object} middlewares
 * @returns {Function}
 */
module.exports = function(app, middlewares) {
	let criteriaService = app.get('services').criteria,
		CriteriaError = app.get('errors').CriteriaError

	/**
	 * {input} is optional string input
	 */
	return (primaryModel, criteriaOptions = {}, isPOST = false) => {
		return function parseCriteriaForMany(req, res, next) {
			const input = isPOST ? req.body : req.query
			const criteria = criteriaService.createFromQueryObjectForMany(primaryModel, input, criteriaOptions)
			const errors = criteriaService.findErrors(criteria, primaryModel, criteriaOptions)
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
