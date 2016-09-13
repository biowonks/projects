'use strict'

// Local
const errors = require('./errors')

// Other
let routeHelperMap = new Map()

module.exports =
class RouteHelper {
	/**
	 * @param {Model} model - Sequelize model to retrieve / create for ${model}
	 * @returns {RouteHelper}
	 */
	static for(model) {
		let routeHelper = routeHelperMap.get(model.name)
		if (!routeHelper) {
			routeHelper = new RouteHelper(model)
			routeHelperMap.set(model.name, routeHelper)
		}

		return routeHelper
	}

	/**
	 * @constructor
	 * @param {Model} model - Sequelize model for this route helper
	 */
	constructor(model) {
		this.model_ = model
	}

	/**
	 * This convenience method returns a function for searching all records for a given model taking
	 * into account the page, records per page, sorting, etc.
	 *
	 * - per_page (default 30)
	 * - page (default 1)
	 * - Sorting
	 * - Filtering
	 * - Partial fields
	 * - Nested record fields
	 * - Total count respecting conditions
	 *
	 * @returns {Function} - express compatible handler function
	 */
	findManyHandler() {
		return (req, res, next) => {
			this.model_.findAll(res.locals.criteria)
			.then((entities) => {
				res.json(entities)
			})
			.catch(next)
		}
	}

	/**
	 * Convenience method for searching for a single record identified by the value contained into
	 * req.params[${paramName}]. Throws 404 if the database query does not return a record.
	 *
	 * @param {String} [paramName = 'id'] - name of parameter in req.params to use as when looking up the value to place on the criteria
	 * @param {String} [fieldName = null] - defaults to ${paramName}
	 * @returns {Function} - express compatible handler function
	 */
	findHandler(paramName = 'id', fieldName = null) {
		return (req, res, next) => {
			if (!Reflect.has(req.params, paramName))
				throw new Error(`route parameter, ${paramName}, not found`)

			let queryValue = req.params[paramName].trim()
			if (!queryValue)
				throw new Error(`route parameter, ${paramName}, must not be empty`)

			let criteria = res.locals.criteria
			if (!criteria)
				throw new Error('criteria has not been defined')

			if (!criteria.where)
				criteria.where = {}

			criteria.where = {
				[fieldName || paramName]: queryValue
			}

			this.model_.findOne(criteria)
			.then((entity) => {
				if (!entity) {
					next(errors.notFoundError)
					return
				}

				res.json(entity)
			})
			.catch(next)
		}
	}
}
