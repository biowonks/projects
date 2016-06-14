'use strict'

// Core
let path = require('path')

// Local
let AnalyticsService = require('./AnalyticsService')

module.exports = function(app) {
	let config = app.get('config')

	return {
		analytics: new AnalyticsService(config.analytics.gaTrackingId, {
			baseUrl: config.server.baseUrl,
			beaconImageFile: path.resolve(__dirname, '..', 'assets', 'img', 'beacon.gif')
		})
	}
}
