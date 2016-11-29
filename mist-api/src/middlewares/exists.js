'use strict'

/**
 * Checks for the existence of an entity in the database and assigns it to the local response
 * variable. Throws NotFoundError if it is not found.
 *
 * @param {Object} app
 * @param {Object} middlewares
 * @returns {Function}
 */
module.exports = function(app, middlewares) {
	let errors = app.get('errors')

	/**
	 * @param {Model} model
	 * @param {Object} options
	 * @param {String} options.attribute - attribute of ${model} to query
	 * @param {String} options.paramName - name of query parameter to use to get the search value to search for
	 * @param {String} options.targetName - name to assign resulting entity to in the res.locals Object
	 * @returns {Function}
	 */
	return (model, options) => {
		if (!options || !options.queryAttribute || !options.paramName || !options.targetName)
			throw new Error(`Invalid options to *exists* middleware for model: ${model.name}. Please check that queryAttribute, paramName, and targetName are all defined.`)

		return function exists(req, res, next) {
			model.findOne({
				where: {
					[options.queryAttribute]: req.params[options.paramName]
				},
				attributes: options.attributes
			})
			.then((entity) => {
				if (!entity)
					throw errors.notFoundError

				res.locals[options.targetName] = entity
				next()
			})
			.catch(next)
		}
	}
}
