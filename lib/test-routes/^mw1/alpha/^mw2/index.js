'use strict';

module.exports = function() {
	return function(req, res, next) {
		res._data_.push('mw2');
		next();
	};
};
