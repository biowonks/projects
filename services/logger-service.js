'use strict';

var bunyan = require('bunyan');

module.exports = function(options) {
	return bunyan.createLogger(options || {name: 'unknown'});
};
