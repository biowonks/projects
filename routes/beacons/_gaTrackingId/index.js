'use strict';

/*
 * This service provides a simple mechanism for proxying custom events to GA. Since the
 * GA collects events simply by utilizing a GET request for a transparent image, why use
 * a proxy?
 * 1) GA expects each visitor to have a unique ID. This cannot be generated on the fly
 *    in static content (e.g. emails)
 * 2) Sometimes cookies are necessary and these too require an interpreter to handle
 *    before passing along the request to google.
 *
 * The universal-analytics package does both of the above for us.
 *
 * Reference: https://github.com/igrigorik/ga-beacon#faq
 */
module.exports = function(route, routeName, app) {
	var analyticsService = app.get('services').analytics,
		beaconImageFile = app.get('config').analytics.beaconImageFile;

	var ApiError = app.get('errors').ApiError;

	route.get(function(req, res, next) {
		var gaTrackingId = req.params.gaTrackingId,
			// analyticsId: alias for the userId parameter that GA expects. Essentially, provides for uniquely identifying
			// a user within GA without using a PIIA
			category = req.query.c,
			action = req.query.a,
			label = req.query.l,
			value = req.query.v,
			analyticsId = req.query.u;

		try {
			analyticsService.sendEventTo(gaTrackingId, category, action, label, value, analyticsId);
		}
		catch (error) {
			throw new ApiError('Error sending tracking event', {
				gaTrackingId: req.params.gaTrackingId,
				category: category,
				action: action,
				label: label,
				value: value,
				analyticsId: analyticsId
			});
		}

		res.sendFile(beaconImageFile);
	});
};
