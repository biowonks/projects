'use strict';

module.exports = function() {
	return function(req, res, next) {
		res._data_ = ['mw1'];
		next();
	};
};
