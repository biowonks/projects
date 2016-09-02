'use strict'

// Core
const path = require('path')

// Local
const AnalyticsService = require('mist-lib/services/AnalyticsService'),
	CriteriaService = require('lib/services/CriteriaService'),
	TaxonomyService = require('mist-lib/services/TaxonomyService')

module.exports = function(app) {
	let logger = app.get('logger'),
		config = app.get('config'),
		models = app.get('models')

	return {
		analytics: new AnalyticsService(config.analytics.gaTrackingId, {
			baseUrl: config.server.baseUrl,
			beaconImageFile: path.resolve(__dirname, '..', 'assets', 'img', 'beacon.gif')
		}),
		criteria: new CriteriaService(models),
		taxonomy: new TaxonomyService(models.Taxonomy, logger)
	}
}
