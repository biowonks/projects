'use strict'

// Vendor
const loadModels = require('sequelize-model-loader')

module.exports = function(sequelize, schema = null, logger = null) {
	const modelExtras = require('core-lib/model-extras')(sequelize.Sequelize) // eslint-disable-line global-require
	const models = loadModels(__dirname, sequelize, {
		logger,
		schema,
		context: modelExtras
	})
	return models
}
