'use strict'

// Constants
const kDefaultPerPage = 2,
	kMaxPerPage = 100

// Other
let routeHelperMap = new Map()

module.exports =
class RouteHelper {
	static get(model) {
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
			// TODO: Refactor into service?
			let perPage = this.perPageFrom(req),
				page = this.pageFrom(req),
				offset = this.offsetFromPage(page, perPage)

			this.model_.findAll({
				limit: perPage,
				offset
			})
			.then((entities) => {
				res.json(entities)
			})
			.catch(next)
		}
	}

	/**
	 * @param {Object} req - express request object
	 * @returns {Number} - amount to expect per page; if invalid returns the default per page otherwise the result is clamped between 0 and the maximum per page
	 */
	perPageFrom(req) {
		let perPage = Math.floor(Number(req.query.per_page))
		if (req.query.per_page === '' || isNaN(perPage))
			return kDefaultPerPage

		perPage = Math.max(0, Math.min(perPage, kMaxPerPage))
		return perPage
	}

	/**
	 * @param {Object} req - express request object
	 * @returns {Number} - 1-based page number; defaults to 1 if not specified or invalid
	 */
	pageFrom(req) {
		let page = Math.floor(Number(req.query.page))
		if (!page || isNaN(page) || page < 1)
			return 1

		return page
	}

	/**
	 * @param {Number} currentPage - 1-based page
	 * @param {NUmber} perPage
	 * @returns {Number}
	 */
	offsetFromPage(currentPage, perPage) {
		return (currentPage - 1) * perPage
	}
}
