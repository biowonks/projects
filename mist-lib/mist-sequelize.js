'use strict'

// Vendor
const Sequelize = require('sequelize')

/**
 * Creates the base sequelize instance bootstrapped with all MiST specific extensions (e.g. global
 * class methods).
 *
 * @param {Object} [dbConfig = {}]
 * @param {Object} [dbConfig.sequelizeOptions = {dialect: 'postgres'}}] - options to pass directly to the Sequelize constructor.
 * @param {String} [dbConfig.name] - database name
 * @param {String} [dbConfig.user] - database user
 * @param {String} [dbConfig.password] - database password for the database user
 * @returns {Sequelize}
 */
module.exports = function(dbConfig = {}) {
	if (!dbConfig.sequelizeOptions)
		dbConfig.sequelizeOptions = {}
	if (!dbConfig.sequelizeOptions.dialect)
		dbConfig.sequelizeOptions.dialect = 'postgres'

	let sequelizeOptions = dbConfig.sequelizeOptions
	if (!sequelizeOptions.define)
		sequelizeOptions.define = {}

	for (let defineProperty of ['underscored', 'timestamps']) {
		if (Reflect.has(sequelizeOptions.define, defineProperty))
			throw new Error(`the "${defineProperty}" sequelize option may not be configured`)
	}

	// Enforce underscored table names and timestamps by default
	sequelizeOptions.define.underscored = true
	sequelizeOptions.define.timestamps = true

	addClassMethods(sequelizeOptions.define)
	return new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, sequelizeOptions)
}

/**
 * Extends ${define} with the following class methods to the all models:
 * - $excludedFromCriteria
 * - $criteriaAttributes
 *
 * @param {Object} define
 */
function addClassMethods(define) {
	if (!define.classMethods)
		define.classMethods = {}

	/**
	 * @returns {Set} - those attributes which are excluded from selection via the CriteriaService
	 */
	define.classMethods.$excludedFromCriteria = function() {
		return null
	}

	/**
	 * @returns {Array.<String>} - attributes that may be selected via the CriteriaService; if null, indicates all attributes may be selected
	 */
	define.classMethods.$criteriaAttributes = function() {
		return null
	}
}

// Export the Sequelize property for downstream use
module.exports.Sequelize = Sequelize
