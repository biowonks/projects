'use strict';

var _ = require('lodash'),
	ua = require('universal-analytics');

var AnalyticsService = function(gaTrackingId, options) {
	if (gaTrackingId && !this.isValidTrackingId(gaTrackingId))
		throw new Error('Invalid GA tracking ID: ' + gaTrackingId);

	this.visitor_ = ua(gaTrackingId);
	if (options)
		this.beaconBaseUrl_ = options.beaconBaseUrl;
};

AnalyticsService.prototype.beaconEventUrl = function(category, action, optLabel, optValue, optUserId) {
	if (!category || !_.isString(category))
		throw new Error('Invalid category; expected non-empty string');

	if (!action || !_.isString(action))
		throw new Error('Invalid action; expected non-empty string');

	if (optValue && !/^\d+$/.test(optValue))
		throw new Error('Invalid value; expected integer greater than or equal to zero');

	if (optLabel && !_.isString(optLabel))
		throw new Error('Invalid label; expected string');

	if (optUserId && !_.isString(optUserId) && !_.isNumber(optUserId))
		throw new Error('Invalid userId; expected string or number');

	var trackingId = this.trackingId();
	if (!trackingId || !this.beaconBaseUrl_)
		return null;

	var url = this.beaconBaseUrl_ + '/' + trackingId + '?c=' + category + '&a=' + action;

	if (optLabel)
		url += '&l=' + optLabel;

	if (optValue)
		url += '&v=' + optValue;

	if (optUserId)
		url += '&u=' + optUserId;

	return url;
};

AnalyticsService.prototype.isValidTrackingId = function(gaTrackingId) {
	return /^UA-\d+-\d+$/.test(gaTrackingId);
};

// userId = non personally identifying (analyticsId in the user model)
AnalyticsService.prototype.sendEvent = function(category, action, optLabel, optValue, optUserId) {
	if (!category || !/\S/.test(category))
		throw new Error('Category must not be empty');

	if (!action || !/\S/.test(action))
		throw new Error('Action must not be empty');

	if (optValue && !/^\d+$/.test(optValue))
		throw new Error('Value (if defined) must be greater than or equal to 0');

	if (this.trackingId()) {
		var other = optUserId ? {uid: optUserId} : undefined;
		this.visitor_.event(category, action, optLabel, optValue, other);
		this.visitor_.send();
	}
};

AnalyticsService.prototype.sendEventTo = function(gaTrackingId, category, action, optLabel, optValue, optUserId) {
	if (!this.isValidTrackingId(gaTrackingId))
		throw new Error('Invalid GA tracking ID: ' + gaTrackingId);

	var originalTrackingId = this.trackingId();
	this.setTrackingId_(gaTrackingId);
	try {
		this.sendEvent(category, action, optLabel, optValue, optUserId);
		this.setTrackingId_(originalTrackingId);
	}
	catch (error) {
		// Restore the original tracking id
		this.setTrackingId_(originalTrackingId);
		throw error;
	}
};

AnalyticsService.prototype.setTrackingId = function(newTrackingGaId) {
	this.visitor_.tid = newTrackingGaId;
};

AnalyticsService.prototype.trackingId = function() {
	return this.visitor_.tid;
};

AnalyticsService.prototype.visitor = function() {
	return this.visitor_;
};

AnalyticsService.prototype.setTrackingId_ = function(newGaTrackingId) {
	this.visitor_.tid = newGaTrackingId;
};

module.exports = AnalyticsService;
