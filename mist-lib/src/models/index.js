/**
 * Each model file should return an object specifying its properties, characteristics, and
 * behavior:
 *
 * {
 *   fields: {
 * 	    $fieldName: {...}
 *   },
 *   name?: // Name of model, defaults to a single word with each sub-word capitalized
 *   params?: {...} // This may be any parameter expected by SequelizeJS,
 * }
 *
 * Only the fields object is required.
 *
 * All files ending in .model.js are considered model files and loaded automatically. After
 * all models are loaded and then all associations setup in associations.js.
 *
 * Notes:
 * - Why the .model.js suffix? This clearly distinguishes each file as a model definition vs
 *   a class definition (the basename of which matches the class name exactly).
 */
'use strict'

// Vendor
const modelLoader = require('sequelize-model-loader')

// Local
const setupAssociations = require('./associations')

module.exports = function(sequelize, logger = null) {
	const modelExtras = require('./model-extras')(sequelize.Sequelize) // eslint-disable-line global-require

	let models = modelLoader(__dirname, sequelize, {
		logger,
		context: modelExtras
	})
	setupAssociations(models, logger)
	return models
}
