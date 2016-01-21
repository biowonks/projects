'use strict';

module.exports = function(route, routeName) {
	route.get(function(req, res) {
		res.json({
			routeName: routeName,
			id: req.params.id
		});
	});
};
