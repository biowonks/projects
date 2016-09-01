'use strict'

// Core
let path = require('path')

// Local
let AnalyticsService = require('./AnalyticsService'),
	CriteriaService = require('./CriteriaService'),
	TaxonomyService = require('../pipeline/lib/services/TaxonomyService')

module.exports = function(app) {
	let config = app.get('config'),
		logger = app.get('logger')

	return {
		analytics: new AnalyticsService(config.analytics.gaTrackingId, {
			baseUrl: config.server.baseUrl,
			beaconImageFile: path.resolve(__dirname, '..', 'assets', 'img', 'beacon.gif')
		}),
		criteria: new CriteriaService(app.get('models')),
		taxonomy: new TaxonomyService(app.get('models').Taxonomy, logger)
	}
}
