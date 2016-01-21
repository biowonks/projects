'use strict';

var path = require('path');

var	Router = require('express').Router;

module.exports = function(app, rootPath, optPrefix) {
	var logger = app.get('logger'),
		toolbag = app.get('toolbag') || require('./toolbag');

	function log(arg1, args) {
		if (logger)
			logger.info(arg1, args);
	}

	function middlewareNames(displayRoutePath) {
		var re = /(\^\w+)/g,
			mws = [],
			result;
		while ((result = re.exec(displayRoutePath))) {
			mws.push(result[0]);
		}
		return mws;
	}

	function logRoute(route, displayRoutePath) {
		route.stack.forEach(function(handler) {
			var method = handler.method;
			if (!method)
				return;

			var mwNames = middlewareNames(displayRoutePath),
				mwString = mwNames.join(', '),
				logString = method.toUpperCase();
			if (mwString)
				logString += ' (' + mwString + ')';
			logString += ' ' + route.path;

			log({
				path: route.path,
				method: method,
				directory: displayRoutePath,
				middlewares: mwString
			}, logString);
		});
	}

	var router = Router({		// eslint-disable-line new-cap
		caseSensitive: true,
		strict: true,
		mergeParams: true
	});

	var mwStack = [];	// Array of arrays

	function recurse(srcPath, parentRoutePath, displayRoutePath) {
		var directories = toolbag.directoryList(srcPath);
		directories.forEach(function(directory) {
			var fullPath = path.resolve(srcPath, directory),
				isParam = /^\$\w/.test(directory),
				isMiddleware = /^\^\w/.test(directory),
				partialRoutePath = isParam ? '/:' + directory.substr(1) : '/' + directory,
				nextRoutePath = parentRoutePath + partialRoutePath,
				nextDisplayRoutePath = displayRoutePath + partialRoutePath;

			if (isMiddleware) {
				nextRoutePath = parentRoutePath;

				var middlewares = loadMiddlewares(fullPath);
				if (middlewares)
					mwStack.push(middlewares);
				recurse(fullPath, nextRoutePath, nextDisplayRoutePath);
				if (middlewares)
					mwStack.pop();
				return;
			}

			loadPathRoute(fullPath, nextRoutePath, nextDisplayRoutePath);
		});
	}

	function loadPathRoute(srcPath, routePath, displayRoutePath) {
		if (!toolbag.pathIsLoadable(srcPath))
			return recurse(srcPath, routePath, displayRoutePath);

		var route = router.route(routePath);
		mwStack.forEach(function(mws) {
			mws.forEach(function(mw) {
				route.all(mw);
			});
		});
		// Some routes may return their own middlewares that they want applied to all child routes.
		// In these cases, they either return an array or middleware function which
		// we apply to all descendant routes much like the above middleware paths.
		var middlewares = require(srcPath)(route, routePath, app);
		logRoute(route, displayRoutePath);
		if (middlewares)
			mwStack.push(middlewares instanceof Array ? middlewares : [middlewares]);
		recurse(srcPath, routePath, displayRoutePath);
		if (middlewares)
			mwStack.pop();
	}

	function loadMiddlewares(srcPath) {
		if (!toolbag.pathIsLoadable(srcPath))
			return;

		var middlewares = require(srcPath)(app);
		return middlewares instanceof Array ? middlewares : [middlewares];	// eslint-disable-line consistent-return
	}

	loadPathRoute(rootPath, '/', '/');

	if (optPrefix)
		app.use(optPrefix, router);
	else
		app.use(router);

	recurse(rootPath, '', '');
};
