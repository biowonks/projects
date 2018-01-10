'use strict'

// Core
const url = require('url')

// Local
const errors = require('./errors'),
	headerNames = require('core-lib/header-names')

// Other
let routeHelperMap = new Map()

// Full text search elements
const fullTextTerm = "to_tsvector('english', coalesce(phylum, '') || ' ' || coalesce(class, '') || ' ' || coalesce(orderr, '') || ' ' || coalesce(family, '') || ' ' || name) @@ to_tsquery('english', %fullTextQuery%)";
const query = "SELECT %fields% FROM %table% WHERE %fullTextCond% %otherCondition%";
const limtOffset = '%limit% %offset%';
const pgLimit = 'LIMIT ';
const pgOffset = 'OFFSET ';
const qlimit = '%limit%';
const qoffset = '%offset%'
const fullTextCond = '%fullTextCond%';
const fullTextQuery = '%fullTextQuery%';
const fields = '%fields%';
const table = '%table%';
const otherCondition = '%otherCondition%';
const _and = " AND ";
const modelForRawQuery = "Genome"


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
	findManyHandler(sequelize=null) {
		return (req, res, next) => {
			let countRows = Reflect.has(req.query, 'count')
			if (res.locals.criteria.where && Reflect.has(res.locals.criteria.where, 'search') && this.model_.name === modelForRawQuery) {
				this.findByRawQuery_(sequelize, res, countRows)
				.then((entities) => {
					res.append('Link', this.linkHeaders(req, res.locals.criteria.offset, res.locals.criteria.limit, res.locals.totalCount))

					res.json(entities)
				})
				.catch(next)
			} else {
				this.findAll_(res, countRows)
				.then((entities) => {
					res.append('Link', this.linkHeaders(req, res.locals.criteria.offset, res.locals.criteria.limit, res.locals.totalCount))

					res.json(entities)
				})
				.catch(next)
			}
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

	/**
	 * Returns an array of header-compatible strings for pagination purposes. Depending on what
	 * values are passed for limit, offset, and totalCount, the following header strings are
	 * returned:
	 *
	 * first: always present
	 * last: if totalCount is a positive integer and limit is a positive integer
	 * next: if offset is a positive integer and totalCount is null or perPage * page < totalCount
	 * prev: if page > 1
	 *
	 * At its core, this method simply alters the value of the page query parameter for each
	 * relevant link.
	 *
	 * @param {Object} req - express compatible request object
	 * @param {String} req.protocol
	 * @param {Function} req.get
	 * @param {String} req.originalUrl
	 * @param {Number} [offset = null] - "page"
	 * @param {Number} [limit = null] - "perPage"
	 * @param {Number} [totalCount = null]
	 * @returns {Array.<String>}
	 */
	linkHeaders(req, offset = null, limit = null, totalCount = null) {
		// Set default for offset. Why not just default arguments? It is possible that this method
		// may be called with a null value for offset. In this case, the intended default value of
		// offset will be null and not the intended 0.
		if (offset === null)
			offset = 0 // eslint-disable-line no-param-reassign

		let result = []

		let urlObject = url.parse(req.originalUrl, true)
		urlObject.search = null
		urlObject.protocol = req.protocol
		urlObject.host = req.get('host')
		Reflect.deleteProperty(urlObject.query, 'page')

		let firstLink = url.format(urlObject)
		result.push(`<${firstLink}>; rel="first"`)

		let isValidOffset = typeof offset === 'number' && /^\d+$/.test(offset),
			isValidLimit = this.isPositiveInteger_(limit)

		if (isValidOffset && isValidLimit) {
			let page = Math.floor(offset / limit) + 1,
				lastRow = offset + limit,
				isValidTotalCount = this.isPositiveInteger_(totalCount)

			if (isValidTotalCount)
				lastRow = Math.min(lastRow, totalCount)

			if (isValidTotalCount) {
				if (lastRow < totalCount) {
					urlObject.query.page = page + 1
					let nextLink = url.format(urlObject)
					result.push(`<${nextLink}>; rel="next"`)
				}

				let lastPage = Math.ceil(totalCount / limit)
				if (lastPage > 1)
					urlObject.query.page = lastPage
				else
					Reflect.deleteProperty(urlObject.query, 'page')
				let lastLink = url.format(urlObject)
				result.push(`<${lastLink}>; rel="last"`)
			}

			if (page > 1) {
				if (page - 1 > 1)
					urlObject.query.page = page - 1
				else
					Reflect.deleteProperty(urlObject.query, 'page')
				let prevLink = url.format(urlObject)
				result.push(`<${prevLink}>; rel="prev"`)
			}
		}

		return result
	}

	// ----------------------------------------------------
	// Private methods
	findAll_(res, countRows = false) {
		let criteria = res.locals.criteria
		if (!countRows)
			return this.model_.findAll(criteria)

		// HACK! Sequelizejs bug workaround. If attributes is null, the aggregate function
		// method in sequelizejs chokes with an error.
		if (criteria && criteria.attributes === null)
			Reflect.deleteProperty(criteria, 'attributes')

		return this.model_.findAndCountAll(criteria)
		.then((result) => {
			res.locals.totalCount = result.count
			res.append(headerNames.XTotalCount, result.count)
			return result.rows
		})
	}

	findByRawQuery_(sequelize, res, countRows = false) {
		let criteria = res.locals.criteria;
		//Probably need to take care of plural form more robust way if will be used for other tables
		let fullTextSearch = query.replace(table, this.model_.name+'s');
		let limitOffsetReady = '';
		let qwhere = '';
		let fullTextTermReady;
		let firstTerm = true;

		for (var queryTerm in criteria.where) {
			if (criteria.where.hasOwnProperty(queryTerm)) {
				if (queryTerm === 'search') {
					fullTextTermReady = firstTerm
						? fullTextTerm.replace(fullTextQuery, criteria.where[queryTerm])
						: _and + fullTextTerm.replace(fullTextQuery, criteria.where[queryTerm]);
				} else {
					//It's possible to make this more general if other queries will be made using full-text search
					qwhere = firstTerm
						? qwhere + queryTerm + '=' + `'${criteria.where[queryTerm]}'`
						: qwhere + _and + queryTerm + '=' + `'${criteria.where[queryTerm]}'`;
				}
				firstTerm = false;
			}
		}
		fullTextSearch = fullTextSearch.replace(otherCondition, qwhere.trim()).replace(fullTextCond,  fullTextTermReady);

		limitOffsetReady = criteria.limit
			? limitOffsetReady + limtOffset.replace(qlimit, pgLimit + criteria.limit)
			: limtOffset.replace(qlimit, '');
		limitOffsetReady = criteria.offset
			? limitOffsetReady.replace(qoffset, pgOffset + criteria.offset)
			: limitOffsetReady.replace(qoffset, '');

		if (countRows) {
			return sequelize.query(fullTextSearch.replace(fields, 'count(*)'), { type: sequelize.QueryTypes.SELECT })
			.then((result) => {
				res.locals.totalCount = result[0].count;
				res.append(headerNames.XTotalCount, result[0].count);
				fullTextSearch = this.fillInAttrAndLimit_(fullTextSearch, criteria.attributes, limitOffsetReady);
				return sequelize.query(fullTextSearch, { model: this.model_ });
			});
		}
		fullTextSearch = this.fillInAttrAndLimit_(fullTextSearch, criteria.attributes, limitOffsetReady);
		return sequelize.query(fullTextSearch, { model: this.model_ });
	}

	fillInAttrAndLimit_(searchQuery, attributes, limitOffsetReady) {
		let readyAttributes = []
		if (attributes)
			readyAttributes = attributes;
		else
			readyAttributes = Object.keys(this.model_.attributes);
		//taking care of reserved by postgresql 'order' word issue
		readyAttributes[readyAttributes.indexOf('order')] = 'orderr as order'
		return searchQuery.replace(fields, readyAttributes).concat(' ' + limitOffsetReady);
	}

	isPositiveInteger_(value) {
		return typeof value === 'number' && /^\d+$/.test(value) && value > 0
	}
}