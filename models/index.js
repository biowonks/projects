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
 * All files ending in .js are considered model files except for files beginning
 * with . or _ and of course, this file.
 *
 * All models are initially loaded and then all associations defined in _associations
 * are configured.
 */

'use strict';

var fs = require('fs'),
	path = require('path');

var _ = require('lodash'),
	inflection = require('inflection'),
	Sequelize = require('sequelize');

module.exports = function(sequelize, logger) {
	var models = loadModels(sequelize, logger);
	require(path.resolve(__dirname, '_associations'))(models, logger);
	return models;
};

// ----------------------------------------------------------------------------
function loadModels(sequelize, logger) {
	var models = {};

	logger.info('Loading models');

	getModelFileNames()
	.forEach(function(modelFileName) {
		var definition = require('./' + modelFileName)(Sequelize, models),
			modelName = nameForDefinition(definition, modelFileName);
		setupDefinition(definition, modelName);

		// injectGlobalModelMethods(definition, modelName, sequelize);

		var model = models[modelName] = sequelize.define(modelName, definition.fields, definition.params);

		logger.info('Loaded model:', modelName, '(' + definition.params.tableName + ')');
	});

	return models;
}

function getModelFileNames() {
	return fs.readdirSync(__dirname)
	.filter(function(modelFileName) {
		return modelFileName !== 'index.js' &&
			modelFileName[0] !== '.' &&
			modelFileName[0] !== '_';
	})
	.sort();
}

function nameForDefinition(definition, modelFileName) {
	return 'name' in definition ? definition.name : nameFromFileName(modelFileName);
}

function nameFromFileName(modelFileName) {
	var extname = path.extname(modelFileName),
		basename = path.basename(modelFileName, extname);

	return basename.split('-')
	.map(function(namePart) {
		return inflection.capitalize(inflection.singularize(namePart).toLowerCase());
	})
	.join('');
}

function setupDefinition(definition, modelName) {
	var defaultParams = {
		tableName: defaultTableName(modelName),
		classMethods: {
			fieldNames: Object.keys(definition.fields)
		}
	};

	if (!definition.params)
		definition.params = defaultParams;
	else
		_.defaultsDeep(definition.params, defaultParams);
}

function defaultTableName(modelName) {
	return inflection.underscore(inflection.pluralize(modelName));
}

// function injectGlobalModelMethods(definition, modelName, sequelize) {
// 	if (!definition.params)
// 		definition.params = {};
// 	if (!definition.params.classMethods)
// 		definition.params.classMethods = {};

// 	if ('sequelize' in definition.params.classMethods)
// 		throw new Error(`${modelName} definition error: classMethods.sequelize is a reserved global method name`)

// 	// TODO: Rename this!
// 	definition.params.classMethods.sequelize = function() {
// 		return sequelize;
// 	};
// }
