'use strict'

// Vendor
const loadModels = require('sequelize-model-loader')

module.exports = function(sequelize, logger = null) {
	let models = loadModels(__dirname, sequelize, {
		logger
	})

	// setup assocations, other seqdepot model configuration

	return models
}
