'use strict';

var util = require('util');

var ApiError = require('./api-error');

var RestError = function(code, optMessage, optData) {
	ApiError.call(this, optMessage, optData, code);
};
util.inherits(RestError, ApiError);

// Standard REST errors
RestError.error400 = new RestError(400, 'Bad Request');
RestError.error401 = new RestError(401, 'Unauthorized');
RestError.error403 = new RestError(403, 'Forbidden');
RestError.error404 = new RestError(404, 'Not found');

RestError.prototype.addValidationError = function(path, message) {
	if (!this.errors)
		this.errors = [];

	this.errors.push({
		path: path,
		message: message,
		type: 'ValidationError'
	});
};


// Custom REST errors
RestError.missingJsonHeader = new RestError(400, 'Invalid Content-Type header: application/json required');
RestError.emptyBody = new RestError(400, 'Message body cannot be empty');

// --------------------------------------------------------------------------------------------------------------------
// Static constructor methods
RestError.foreignKeyError = function(targetEntity, optPath, optMessage) {
	var type = 'foreignKey violation',
		message = optMessage || ('Referenced ' + targetEntity + ' does not exist'),
		path = optPath || (targetEntity + '_id');
	return RestError.validationError(type, path, message);
};

RestError.validationError = function(optType, optPath, optMessage) {
	var error = new RestError(400, 'Validation error');
	if (optType || optPath || optMessage) {
		var detail = {};
		if (optType)
			detail.type = optType;
		if (optPath)
			detail.path = optPath;
		if (optMessage)
			detail.message = optMessage;
		error.errors = [detail];
	}
	return error;
};

module.exports = RestError;
