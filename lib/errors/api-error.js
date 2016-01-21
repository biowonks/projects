'use strict';

var util = require('util');

var ApiError = function(optMessage, optData, optCode) {
	Error.call(this);
	if (Error.captureStackTrace)
		Error.captureStackTrace(this, this.constructor);

	this.name = 'ApiError';
	if (optMessage)
		this.message = optMessage;

	if (optData)
		this.data = optData;

	this.code = optCode || 500;
};
util.inherits(ApiError, Error);

module.exports = ApiError;
