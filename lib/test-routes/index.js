'use strict';

module.exports = function(route, routeName) {
	route.get(function(req, res) {
		res.send('GET ' + routeName);
	});

	route.put(function(req, res) {
		res.send('PUT ' + routeName);
	});
};
