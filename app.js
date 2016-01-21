'use strict';

var	cluster = require('cluster'),
	corser = require('corser'),
	express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	Umzug = require('umzug'),
	Promise = require('bluebird'),
	Sequelize = require('sequelize');

var config = require('./config'),
	errorHandler = require('./lib/error-handler'),
	toolbag = require('./lib/toolbag'),
	pathRoutify = require('./lib/path-routify'),
	ApiError = require('./lib/errors/api-error'),
	RestError = require('./lib/errors/rest-error');

var logger = require('./services/logger-service')(config.logger.options);

module.exports = function() {
	// This variable is initialized before returning. Listed here for clarity since the handleUncaughtErrors
	// middleware references it.
	var server;

	// --------------------------------------------------------
	// Main setup
	var app = express(),
		failedSetup = false;
	app.set('errors', {
		ApiError: ApiError,
		RestError: RestError
	});
	app.set('config', config);
	app.set('logger', logger);
	app.set('toolbag', toolbag);

	return setupDatabase()
	.catch(function(error) {
		// If unable to connect to the database, then the app has failed. Tell the master to close
		// it down.
		failedSetup = true;
		logger.fatal('Unable to setup database: ' + error.message);
		process.send('error db');
	})
	.then(function() {
		if (failedSetup)
			return;

		if (config.routing.ssl) {
			logger.info('Forcing all requests to use SSL');
			app.use(forceSSL);
		}
		if (config.cors.enabled) {
			logger.info('Enabling CORS');
			app.use(cors());
		}
		app.use(addVersionToResponse);
		app.use(bodyParser.json());

		app.set('models', require('./models')(app, Sequelize));
		app.set('services', require('./services')(app));

		pathRoutify(app, path.resolve('./routes'), config.routing.prefix);

		app.use(handleUncaughtErrors);
		app.use(errorHandler(app));

		server = app.listen(config.server.port, function() {
			logger.info({port: config.server.port}, 'Listening for connections');
		});

		// Tell master that we are alive and well
		process.send('success');

		return app;
	});

	// --------------------------------------------------------
	// Middlewares
	function handleUncaughtErrors(req, res, next) {
		// References:
		// https://nodejs.org/api/domain.html
		// [Book] Web Development with Node and Express: Leveraging the JavaScript Stack
		var domain = require('domain').create();
		domain.on('error', function(error) {
			logger.fatal({error: error, stack: error.stack}, 'Unhandled error: ' + error.message);
			try {
				var secondsToWait = config.server.restartGraceMs / 1000,
					failSafeTimer = setTimeout(function() {
						logger.fatal('Failsafe shutdown. Waiting for open connections to complete (' + secondsToWait + ' s)');
						process.exit(1);
					}, config.server.restartGraceMs);

				// If the timer is the only thing running, do not keep the program running
				failSafeTimer.unref();

				// Stop taking new requests
				server.close();

				// Tell master we are no longer alive (if relevant)
				if (cluster.worker)
					cluster.worker.disconnect();

				// Attempt to use any express error handler
				try {
					next(error);
				}
				catch (expressError) {
					// Express error route borked out. Attempt to send a plain response
					logger.fatal({error: expressError}, 'Express error handler failed');
					res.statusCode = 500;
					res.setHeader('Content-Type', 'text/plain');
					res.end('Internal server error');
				}
			}
			catch (error2) {
				console.error('Unable to send express 500 error', error2.stack);	// eslint-disable-line no-console
			}
		});

		// Bind req, res to the domian
		domain.add(req);
		domain.add(res);

		// Pass control onto the remaining express stack
		domain.run(next);
	}

	function addVersionToResponse(req, res, next) {
		res.set(config.headerNames.version, config.package.version);
		next();
	}

	// Redirect HTTP requests to HTTPS
	// http://jaketrent.com/post/https-redirect-node-heroku/
	function forceSSL(req, res, next) {
		var isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
		if (isHttps)
			return next();

		res.redirect('https://' + req.get('host') + req.originalUrl);
	}

	function cors() {
		return corser.create({
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			requestHeaders: corser.simpleRequestHeaders.concat([config.headerNames.apiToken]),
			responseHeaders: corser.simpleResponseHeaders.concat([config.headerNames.version])
		});
	}

	// --------------------------------------------------------
	// Utility functions
	function setupDatabase() {
		var dbConfig = config.database;
		if (!dbConfig.enabled)
			return Promise.resolve();

		logger.info('Validating database connection');

		if (!dbConfig.name) {
			logger.fatal('Invalid database configuration: missing database name');
			return Promise.reject(new Error('Database enabled, but missing configuration (name)'));
		}

		var sequelize,
			umzug;

		try {
			sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, dbConfig.sequelizeOptions);
		}
		catch (error) {
			return Promise.reject(error);
		}

		app.set('sequelize', sequelize);

		return sequelize.authenticate()
		.catch(function(error) {
			logger.fatal('Unable to authenticate with database: ' + error.message);
			throw error;
		})
		.then(function() {
			logger.info('Successfully connected to database');

			var options = config.migrations.umzug;

			// Assign sequelize instance to the umzug engine if relevant
			if (options.storage === 'sequelize') {
				var DataTypes = sequelize.constructor,
					migration = sequelize.getQueryInterface();

				options.storageOptions.sequelize = sequelize;
				options.migrations.params = [migration, DataTypes];
			}

			umzug = new Umzug(options);
			return umzug.pending();
		})
		.then(function(migrations) {
			if (!migrations.length)
				return null;

			logger.info('Running migrations');

			return umzug.up()
			.then(function(finishedMigrations) {
				finishedMigrations.forEach(function(migration) {
					logger.info({sqlFile: migration.file}, '  >> ' + migration.file);
				});

				logger.info('Migrations complete');
			})
			.catch(function(error) {
				logger.fatal('Unable to perform migrations: ' + error.message);
				throw error;
			});
		});
	}
};
