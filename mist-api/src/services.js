'use strict'

// Core
const path = require('path')

// Local
const AnalyticsService = require('mist-lib/services/AnalyticsService')
const CriteriaService = require('lib/services/CriteriaService')
const TaxonomyService = require('mist-lib/services/TaxonomyService')

module.exports = function(app) {
	const logger = app.get('logger')
	const config = app.get('config')
	const models = app.get('models')

	return {
		analytics: new AnalyticsService(config.analytics.gaTrackingId, {
			baseUrl: config.server.baseUrl,
			beaconImageFile: path.resolve(__dirname, '..', 'assets', 'img', 'beacon.gif')
		}),
		criteria: new CriteriaService(models),
		taxonomy: new TaxonomyService(models.Taxonomy, logger)
	}
}
