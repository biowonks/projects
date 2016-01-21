'use strict';

var path = require('path');

var AnalyticsService = require('./analytics-service');

module.exports = function(app) {
	var config = app.get('config');

	return {
		analytics: new AnalyticsService(config.analytics.gaTrackingId, {
				baseUrl: config.server.baseUrl,
				beaconImageFile: path.resolve(__dirname, '..', 'assets', 'img', 'beacon.gif')
			})
	};
};
