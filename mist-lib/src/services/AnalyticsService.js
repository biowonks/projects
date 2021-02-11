'use strict';

// Vendor
const ua = require('universal-analytics');

module.exports =
class AnalyticsService {
  constructor(gaTrackingId, options) {
    if (gaTrackingId && !this.isValidTrackingId(gaTrackingId))
      throw new Error('Invalid GA tracking ID: ' + gaTrackingId);

    this.visitor_ = ua(gaTrackingId);
    if (options)
      this.beaconBaseUrl_ = options.beaconBaseUrl;
  }

  beaconEventUrl(category, action, optLabel, optValue, optUserId) {
    if (!category || !(typeof category === 'string'))
      throw new Error('Invalid category expected non-empty string');

    if (!action || !(typeof action === 'string'))
      throw new Error('Invalid action expected non-empty string');

    if (optValue && !/^\d+$/.test(optValue))
      throw new Error('Invalid value expected integer greater than or equal to zero');

    if (optLabel && !(typeof optLabel === 'string'))
      throw new Error('Invalid label expected string');

    if (optUserId && !(typeof optUserId === 'string') && !(typeof optUserId === 'number'))
      throw new Error('Invalid userId expected string or number');

    let trackingId = this.trackingId();
    if (!trackingId || !this.beaconBaseUrl_)
      return null;

    let url = this.beaconBaseUrl_ + '/' + trackingId + '?c=' + category + '&a=' + action;

    if (optLabel)
      url += '&l=' + optLabel;

    if (optValue)
      url += '&v=' + optValue;

    if (optUserId)
      url += '&u=' + optUserId;

    return url;
  }

  isValidTrackingId(gaTrackingId) {
    return /^UA-\d+-\d+$/.test(gaTrackingId);
  }

  // userId = non personally identifying (analyticsId in the user model)
  sendEvent(category, action, optLabel, optValue, optUserId) {
    if (!category || !/\S/.test(category))
      throw new Error('Category must not be empty');

    if (!action || !/\S/.test(action))
      throw new Error('Action must not be empty');

    if (optValue && !/^\d+$/.test(optValue))
      throw new Error('Value (if defined) must be greater than or equal to 0');

    if (this.trackingId()) {
      let other = optUserId ? {uid: optUserId} : null;
      this.visitor_.event(category, action, optLabel, optValue, other);
      this.visitor_.send();
    }
  }

  sendEventTo(gaTrackingId, category, action, optLabel, optValue, optUserId) {
    if (!this.isValidTrackingId(gaTrackingId))
      throw new Error('Invalid GA tracking ID: ' + gaTrackingId);

    let originalTrackingId = this.trackingId();
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
  }

  setTrackingId(newTrackingGaId) {
    this.visitor_.tid = newTrackingGaId;
  }

  trackingId() {
    return this.visitor_.tid;
  }

  visitor() {
    return this.visitor_;
  }

  setTrackingId_(newGaTrackingId) {
    this.visitor_.tid = newGaTrackingId;
  }
};
