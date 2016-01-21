'use strict';

module.exports = function(route, routeName) {
	route.all(function(req, res, next) {
		res._data_.push(routeName);
		next();
	});

	route.get(function(req, res) {
		res.json({
			method: 'GET',
			data: res._data_
		});
	});
};
