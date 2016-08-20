'use strict'

// Local
const CriteriaError = require('../lib/errors/criteria-error')

// Constants
const kDefaults = {
	perPage: 30,	// Number of records to return per page
	maxPage: 100,	// Maximum page that may be retrieved
	maxPerPage: 100 // Maximum per page value that may be accepted
}

// --------------------------------------------------------
class ModelNode {
	/**
	 * Private node class for mapping query string fields to their corresponding models.
	 *
	 * @constructor
	 * @param {String} [name = null] - name of the target model
	 * @param {*} [value = null]
	 */
	constructor(name = null, value = null) {
		this.modelName = name
		this.value = value
		this.children = new Map()
	}

	/**
	 * Finds the descendant ModelNode using the names in ${modelNames} as a path to the relevant
	 * node. Any non-existent ModelNode's are created on demand.
	 *
	 * @param {Array.<String>} modelNames
	 * @returns {ModelNode}
	 */
	findOrCreate(modelNames) {
		// eslint-disable-next-line consistent-this
		let ref = this
		modelNames.forEach((modelName) => {
			let childNode = ref.children.get(modelName)
			if (!childNode) {
				childNode = new ModelNode(modelName)
				ref.children.set(modelName, childNode)
			}
			ref = childNode
		})
		return ref
	}
}

module.exports =
class CriteriaService {
	/**
	 * Facilitates the construction of the criteria to use when querying with the Sequelize library.
	 *
	 * @constructor
	 * @param {Array.<Model>} models
	 * @param {Object} [options = {}]
	 * @param {Number} [options.defaultPerPage = 30] - default number of records to return per page
	 * @param {Number} [options.maxPage = 100] - maximum page that may be fetched
	 * @param {Number} [options.maxPerPage = 100] - absolute maximum number of records that may be returned per page
	 */
	constructor(models, options = {}) {
		this.models_ = models
		this.defaultPerPage_ = Number(options.defaultPerPage) || kDefaults.perPage
		this.maxPage_ = Number(options.maxPage) || kDefaults.maxPage
		this.maxPerPage_ = Number(options.maxPerPage) || kDefaults.maxPerPage
	}

	/**
	 * @returns {Number}
	 */
	defaultPerPage() {
		return this.defaultPerPage_
	}

	/**
	 * @returns {Number}
	 */
	maxPage() {
		return this.maxPage_
	}

	/**
	 * @returns {Number}
	 */
	maxPerPage() {
		return this.maxPerPage_
	}

	/**
	 * # Per page (URL parameter name: per_page)
	 * A positive number of primary records to return per page. Defaults to 30 (or the amount
	 * passed into the constructor options). If anything other than a positive integer, returns the
	 * default. Capped to the configured maximum per page (default of 100, may be modified via the
	 * constructor options).
	 *
	 * # Page (URL parameter name: page)
	 * A positive integer indicating which page of results to fetch. If not provided, defaults to 1.
	 *
	 * # Fields (URL parameter name: fields)
	 * If the fields parameter is not defined, all fields are returned. To limit the response to
	 * a set of primary modelattributes, use a CSV list of the desired model field names:
	 *
	 *     fields=id,name,created_at
	 *
	 * If only requesting fields from a related model, use dot notation to qualify the relevant
	 * model:
	 *
	 *     fields.WorkerModule=id,module,state (returns only the id, module, and state)
	 *     fields.WorkerModule=true (return all attributes for WorkerModule)
	 *     fields.WorkerModule=false (do not return any of these attributes)
	 *
	 * Selecting fields from multiple related models is also supported:
	 *
	 *     fields.WorkerModule=id,state&fields.Component=description
	 *
	 * Related models may be nested as well:
	 *
	 *     fields.Component.Gene=accession,start,stop,strand (returns the specified gene attributes,
	 *       however, it will also retrieve all Component fields unless otherwise specified).
	 *
	 * Throws a CriteriaError if an invalid attribute, inaccessible attribute, or model is
	 * encountered.
	 *
	 * @param {Model} primaryModel - the base model with which to analyze ${queryObject}
	 * @param {Object} queryObject - a querystring (core module) compatible set of parameters; typically this originates from the query string of a URL
	 * @returns {Object} - criteria object compatible with Sequelizejs find operations
	 */
	createFromQueryObject(primaryModel, queryObject = {}) {
		if (!primaryModel)
			throw new Error('unable to parse criteria without a primary model')

		if (!this.models_[primaryModel.name])
			throw new Error(`${primaryModel.name} is not one of the models supplied to this service during construction`)

		let perPage = this.perPageFrom(queryObject.per_page),
			page = this.pageFrom(queryObject.page),
			criteria = {
				attributes: null,
				include: null,
				limit: perPage,
				offset: this.offsetFromPage(page, perPage) || null,
				order: [
					primaryModel.primaryKeyAttributes
				]
			},
			rootModelNode = this.createModelTree_(queryObject)

		this.mapFieldsToCriteria_(rootModelNode, criteria, primaryModel)

		return criteria
	}

	/**
	 * @param {Number|String|null} perPage
	 * @returns {Number} - amount to expect per page; if invalid, returns the default per page otherwise the result is clamped between 0 and the maximum per page
	 */
	perPageFrom(perPage) {
		let isValidPerPage = !perPage || /^\d+$/.test(perPage)
		if (!isValidPerPage)
			throw new CriteriaError('invalid per_page query parameter: must be greater than or equal to 0')

		let result = perPage || perPage === 0 ? Number(perPage) : Math.min(this.defaultPerPage_, this.maxPerPage_)
		return Math.max(0, Math.min(result, this.maxPerPage_))
	}

	/**
	 * @param {Number|String|null} page
	 * @returns {Number} - 1-based page number; defaults to 1
	 */
	pageFrom(page) {
		let isValidPage = (!page && page !== 0) || /^[1-9]\d*$/.test(page)
		if (!isValidPage)
			throw new CriteriaError('invalid page query parameter: must be greater than or equal to 1')

		let result = !page ? 1 : Number(page)
		return Math.min(result, this.maxPage_)
	}

	/**
	 * @param {Number} currentPage - 1-based page
	 * @param {NUmber} perPage
	 * @returns {Number}
	 */
	offsetFromPage(currentPage, perPage) {
		let effectiveCurrentPage = Math.max(1, currentPage),
			effectivePerPage = Math.max(0, perPage)

		if (!isNaN(effectiveCurrentPage) && !isNaN(effectivePerPage))
			return (effectiveCurrentPage - 1) * effectivePerPage

		return 0
	}

	/**
	 * @param {Object} target
	 * @param {Model} primaryModel
	 * @param {Array.<Model>} [accessibleModels = null] - related models that may be included in the response
	 * @returns {Array.<Object>}
	 */
	findErrors(target, primaryModel, accessibleModels = null) {
		if (!primaryModel)
			throw new Error('missing primaryModel argument')

		if (!this.models_[primaryModel.name])
			throw new Error(`${primaryModel.name} is not one of the models supplied to this service during construction`)

		let errors = [],
			invalidAttributes = this.invalidAttributes_(target.attributes, primaryModel)
		if (invalidAttributes) {
			errors.push({
				// Technically, this is an invalid attribute; however, from the user's
				// perspective, it is a "field"
				type: 'InvalidFieldError',
				fields: invalidAttributes,
				model: primaryModel.name,
				message: `${primaryModel.name} does not contain the following fields: ${invalidAttributes.join(', ')}`
			})
		}

		let excludedAttributes = this.excludedAttributes_(target.attributes, primaryModel)
		if (excludedAttributes) {
			errors.push({
				type: 'InaccessibleFieldError',
				fields: excludedAttributes,
				model: primaryModel.name,
				message: `Accessing the following ${primaryModel.name} fields is not supported: ${excludedAttributes.join(', ')}`
			})
		}

		let inaccessibleModels = this.inaccessibleModels_(target.include, accessibleModels)
		if (inaccessibleModels) {
			let modelNames = inaccessibleModels.map((x) => x.name)
			errors.push({
				type: 'InaccessibleModelError',
				models: modelNames,
				message: `The following models are not accessible: ${modelNames.join(', ')}`
			})
		}

		// Only assess errors one level deep
		if (errors.length)
			return errors

		// No errors, so far, check included models
		if (target.include) {
			for (let i = 0, z = target.include.length; i < z; i++) {
				let include = target.include[i]
				errors = this.findErrors(include, include.model, accessibleModels)

				if (errors && errors.length)
					return errors
			}
		}

		return null
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * Creates a tree structure of fields from all fields specified in ${queryObject} (such as that
	 * derived by the core querystring module).
	 *
	 * Related model fields may be selected by separating the model names with a '.'. Any empty
	 * model names are ignored. For example, "fields.=id" will be ignored.
	 *
	 * @param {Object.<String, String>} queryObject
	 * @returns {ModelNode}
	 */
	createModelTree_(queryObject) {
		let root = new ModelNode()
		for (let key in queryObject) {
			let matches = /^fields(?:\.(\S+))?/.exec(key)
			if (!matches)
				continue

			let mapKey = matches[1],
				value = queryObject[key]

			if (!mapKey) {
				root.value = value
				continue
			}

			let parts = mapKey.split('.')
					.map((x) => x.trim())
					.filter((x) => !!x)
			if (!parts.length)
				continue

			let node = root.findOrCreate(parts)
			node.value = value
		}
		return root
	}

	/**
	 * Traverses the ${modelNode} tree and maps the requested fields as Sequelize compatible
	 * find options (attributes, include) to ${target}.
	 *
	 * // Given the ModelNode:
	 * ModelNode
	 *   - name = null
	 *   - value = 'id,name,updated_at'
	 *   - children = {
	 *        ModelNode
	 *          - name = 'WorkerModule'
	 *          - value = 'id,module,state'
	 *          - children = {}
	 *        ModelNode
	 *          - name = 'Component'
	 *          - value = 'false'
	 *          - children = {
	 *               ModelNode
	 *                 - name = 'Gene'
	 *                 - value = null
	 *                 - children = {}
	 *            }
	 *     }
	 *
	 * // Will modify target with the following:
	 * {
	 *   attributes: ['id', 'name', 'update_at'],
	 *   include: [
	 *     {
	 *       model: $WorkerModule.Model
	 *       attributes: ['id', 'module', 'state']
	 *     },
	 *     {
	 *       model: $Component.Model
	 *       attributes: [],
	 *       include: [
	 *         {
	 *           model: $Gene.Model,
	 *           attributes: [...] // all of the Gene Model's attributes
	 *         }
	 *       ]
	 *     },
	 *   ]
	 * }
	 *
	 * @param {ModelNode} modelNode
	 * @param {Object} target
	 * @param {Model} primaryModel
	 */
	mapFieldsToCriteria_(modelNode, target, primaryModel) {
		let attributes = this.decodeFieldValue_(primaryModel, modelNode.value)
		if (attributes === false)
			throw new CriteriaError(`Invalid field value for the ${primaryModel.name} model. Valid values include: 'true', 'false', or a CSV-list of field names.`)

		if (attributes)
			target.attributes = attributes

		let includes = []
		for (let [relatedModelName, childNode] of modelNode.children) {
			if (!this.models_[relatedModelName])
				throw new CriteriaError(`Invalid model: ${relatedModelName}`)

			let relatedModel = this.getRelatedModel_(primaryModel.associations, relatedModelName)
			if (!relatedModel) {
				throw new CriteriaError('Invalid criteria', {
					type: 'UnrelatedModelError',
					model: relatedModelName,
					message: `${relatedModelName} is not associated with ${primaryModel.name}`
				})
			}

			let include = {
				model: relatedModel
			}
			this.mapFieldsToCriteria_(childNode, include, relatedModel)
			includes.push(include)
		}

		if (includes.length)
			target.include = includes
	}

	/**
	 * Converts URL encoded field values into it's corresponding Sequelize attributes value. If a
	 * null value is provided, include all attributes marked for inclusion via the criteria
	 * attributes method.
	 *
	 * 'false' -> []
	 * null, '', or 'true' => null (use all fields returned by ${model}.$criteriaAttributes())
	 * 'id,name' (CSV string) -> ['id', 'name']
	 *
	 * @param {Model} model
	 * @param {String} [value = null]
	 * @returns {Array.<String>|false} - if successfully parsed returns an Array; false if an error occurred
	 */
	decodeFieldValue_(model, value = null) {
		if (value === 'false')
			return []
		else if (value === null || value === '' || value === 'true')
			return model.$criteriaAttributes()
		else if (typeof value === 'string')
			return this.nonEmptyFields_(value)

		// ${value} is something other than null or a string; indicate this is invalid by returning
		// false
		return false
	}

	/**
	 * Splits ${string} into an array of strings using the ',' as a separator and ignores all empty
	 * words.
	 *
	 * @param {String} string
	 * @returns {Array.<String>}
	 */
	nonEmptyFields_(string) {
		if (!string)
			return null

		return string.split(',')
			.map((x) => x.trim())
			.filter((x) => !!x)
	}

	/**
	 * In most cases, models are related with a hasOne, hasMany, and belongsTo association; however,
	 * belongsToMany associations will not have the related model name directly on the model
	 * associations object. As such, this method both checks that the models are correctly related
	 * and updates the include model reference if it is through a belongsToMany relationship.
	 *
	 * @param {Object} associations
	 * @param {String} relatedModelName
	 * @returns {Model}
	 */
	getRelatedModel_(associations, relatedModelName) {
		let association = associations[relatedModelName]
		if (association)
			return association.target

		// Perhaps it is related through a belongsToMany relationship which will not have the
		// relatedModelName directly on the associations object (e.g. marketplace_solutions
		// belontsToMany Category through MarketplaceSolutionsCategories)
		let associationKeys = Object.keys(associations)
		for (let i = 0, z = associationKeys.length; i < z; i++) {
			association = associations[associationKeys[i]]
			if (association.target.name === relatedModelName)
				return association.target
		}

		return null
	}

	/**
	 * @param {Array.<String>} attributes
	 * @param {Model} model
	 * @returns {Array.<String>} - those attributes in ${attributes} that are not present in ${model}
	 */
	invalidAttributes_(attributes, model) {
		if (!attributes || attributes.length === 0)
			return null

		let invalidAttributes = attributes.filter((attribute) => !model.attributes[attribute])
		return invalidAttributes.length ? invalidAttributes : null
	}

	/**
	 * @param {Array.<String>} attributes
	 * @param {Model} model
	 * @returns {Array.<String>} - requested attributes that are not permitted to be requested (the model definition marks them as excluded)
	 */
	excludedAttributes_(attributes, model) {
		let excludeSet = model.$excludedFromCriteria(),
			notRequestingAnyAttributes = attributes && attributes.length === 0
		if (!excludeSet || excludeSet.size === 0 || notRequestingAnyAttributes)
			return null

		let requestingAllAttributes = attributes === null
		if (requestingAllAttributes)
			return [...excludeSet]

		let excluded = attributes.filter((attribute) => excludeSet.has(attribute))
		return excluded.length ? excluded : null
	}

	/**
	 * @param {Object} include
	 * @param {Array.<Model>} accessibleModels
	 * @returns {Array.<Model>} - an associated model that has not been whitelisted for inclusion
	 */
	inaccessibleModels_(include, accessibleModels) {
		if (!include || include.length === 0)
			return null

		if (!accessibleModels || accessibleModels.length === 0)
			return include.map((x) => x.model)

		let inaccessibleModels = include
			.filter((subInclude) => !accessibleModels.includes(subInclude.model))
			.map((subInclude) => subInclude.model)
		return inaccessibleModels.length ? inaccessibleModels : null
	}
}

// Expose the defaults
module.exports.kDefaults = kDefaults
