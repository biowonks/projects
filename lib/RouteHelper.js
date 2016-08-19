'use strict'

// Other
let routeHelperMap = new Map()

module.exports =
class RouteHelper {
	static for(model) {
		let routeHelper = routeHelperMap.get(model.name)
		if (!routeHelper) {
			routeHelper = new RouteHelper(model)
			routeHelperMap.set(model.name, routeHelper)
		}

		return routeHelper
	}

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
	findAllHandler() {
		return (req, res, next) => {
			this.model_.findAll(res.locals.criteria)
			.then((entities) => {
				res.json(entities)
			})
			.catch(next)
		}
	}
}
