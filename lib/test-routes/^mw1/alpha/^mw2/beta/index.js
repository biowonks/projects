'use strict';

module.exports = function(route, routeName) {
	route.get(function(req, res) {
		res._data_.push(routeName);
		res.json({
			method: 'GET',
			data: res._data_
		});
	});
};
