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

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const _ = require('lodash'),
	inflection = require('inflection'),
	Sequelize = require('sequelize')

// Local
const modelExtras = require('./model-extras')(Sequelize), // eslint-disable-line no-mixed-requires
	setupAssociations = require('./associations')

// Constants
const kModelFileNameSuffix = '.model.js' // All files ending with this are treated as models

module.exports = function(sequelize, logger) {
	let models = loadModels(sequelize, logger)
	setupAssociations(models, logger)
	return models
}

// ----------------------------------------------------------------------------
function loadModels(sequelize, logger) {
	let models = {}

	logger.info('Loading models')

	getModelFileNames()
	.forEach((modelFileName) => {
		// eslint-disable-next-line global-require
		let definition = require('./' + modelFileName)(Sequelize, models, modelExtras)
		if (!definition)
			throw new Error(`Missing return value from model file, ${modelFileName}`)

		let modelName = nameForDefinition(definition, modelFileName)
		setupDefinition(definition, modelName)

		models[modelName] = sequelize.define(modelName, definition.fields, definition.params)

		logger.info({modelName, table: definition.params.tableName}, `Loaded model: ${modelName} (${definition.params.tableName} table)`)
	})

	return models
}

function getModelFileNames() {
	return fs.readdirSync(__dirname)
	.filter((modelFileName) => modelFileName.endsWith(kModelFileNameSuffix))
	.sort()
}

function nameForDefinition(definition, modelFileName) {
	return 'name' in definition ? definition.name : nameFromFileName(modelFileName)
}

function nameFromFileName(modelFileName) {
	return path.basename(modelFileName, kModelFileNameSuffix)
}

function setupDefinition(definition, modelName) {
	let defaultParams = {
		tableName: defaultTableName(modelName),
		classMethods: {
			fieldNames: Object.keys(definition.fields)
		}
	}

	if (!definition.params)
		definition.params = defaultParams
	else
		_.defaultsDeep(definition.params, defaultParams)
}

function defaultTableName(modelName) {
	return inflection.underscore(modelName)
		.split('_')
		.map((val) => inflection.pluralize(val))
		.join('_')
}
