'use strict';

var chai = require('chai'),
	supertestAsPromised = require('supertest-as-promised');

var appFn = require('../app');

// --------------------------------------------------------
// One-time app
var harness = {
	app: null
};

(function initialize() {
	global.expect = chai.expect;

	appFn()
	.then(function(app) {
		harness.app = app;
		harness.request = supertestAsPromised(app);

		injectRoutePrefix(app.get('config').routing.prefix, harness.request);
	});

	function injectRoutePrefix(prefix, request, optHttpVerbs) {
		if (!prefix)
			return;

		var httpVerbs = optHttpVerbs ? optHttpVerbs : ['get', 'post', 'put', 'delete'];
		httpVerbs.forEach(function(httpVerb) {
			var tmpFn = request[httpVerb];
			request[httpVerb] = function(partialUrl) {
				return tmpFn(prefix + partialUrl);
			};
		});
	}
})();

module.exports = function() {
	return harness;
};
