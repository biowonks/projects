'use strict'

// Core
let	cluster = require('cluster'),
	path = require('path')

// Vendor
let corser = require('corser'),
	express = require('express'),
	bodyParser = require('body-parser')

// Local
let	errorHandler = require('./lib/error-handler'),
	toolbag = require('./lib/toolbag'),
	pathRoutify = require('./lib/path-routify'),
	loadServices = require('./services'),
	ApiError = require('./lib/errors/api-error'),
	BootStrapper = require('./services/BootStrapper'),
	RestError = require('./lib/errors/rest-error')

// Constants
const kMsPerSecond = 1000

module.exports = function() {
	// This letable is initialized before returning. Listed here for clarity since the handleUncaughtErrors
	// middleware references it.
	let server = null,
		bootStrapper = new BootStrapper({
			logger: {
				workerId: cluster.worker.id
			}
		}),
		logger = bootStrapper.logger(),
		config = BootStrapper.config,
		sigTermSignalReceived = false,
		failedSetup = false

	process.on('message', (message) => {
		if (message === 'SIGTERM')
			onSigTerm()
	})

	return bootStrapper.setup()
	.catch(function(error) {
		// If unable to connect to the database, then the app has failed. Tell the master to close
		// it down.
		failedSetup = true
		logger.fatal(error, 'Unable to setup database: ' + error.message)
		process.send('error db')
	})
	.then(function(sequelize) {
		if (failedSetup)
			return null

		// --------------------------------------------------------
		// Main setup
		let app = express()
		app.set('errors', {ApiError, RestError})
		app.set('config', config)
		app.set('logger', logger)
		app.set('toolbag', toolbag)
		app.set('sequelize', bootStrapper.sequelize())
		app.set('models', bootStrapper.models)

		if (config.routing.ssl) {
			logger.info('Forcing all requests to use SSL')
			app.use(forceSSL)
		}

		if (config.cors.enabled) {
			logger.info('Enabling CORS')
			app.use(cors())
		}

		app.use(addVersionToResponse)
		app.use(bodyParser.json())

		app.set('services', loadServices(app))

		pathRoutify(app, path.resolve('./routes'), config.routing.prefix)

		app.use(handleUncaughtErrors)
		app.use(errorHandler(app))

		server = app.listen(config.server.port, () => {
			logger.info({port: config.server.port}, 'Listening for connections')

			// Tell master that we are ready to go
			process.send('ready')
		})

		return app
	})

	// --------------------------------------------------------
	function onSigTerm() {
		// Prevent multiple calls to
		if (sigTermSignalReceived)
			return

		sigTermSignalReceived = true
		logger.info(`Received SIGTERM signal from master. Waiting ${config.server.workerExitGraceMs / kMsPerSecond} seconds for open connections to complete`)
		if (server) {
			server.close(() => {
				logger.info('All connections done, exiting normally')
				exit()
			})

			let failSafeTimer = setTimeout(() => {
				logger.fatal('Timed out waiting for open connections to close normally, forcefully exiting')
				exit(1)
			}, config.server.workerExitGraceMs)

			failSafeTimer.unref()
		}
		else {
			exit()
		}
	}

	function exit(optCode = 0) {
		process.exit(optCode)
	}

	// --------------------------------------------------------
	// Middlewares
	function handleUncaughtErrors(req, res, next) {
		// References:
		// https://nodejs.org/api/domain.html
		// [Book] Web Development with Node and Express: Leveraging the JavaScript Stack
		let domain = require('domain').create() // eslint-disable-line global-require
		domain.on('error', function(error) {
			logger.fatal({error, stack: error.stack}, 'Unhandled error: ' + error.message)
			try {
				let secondsToWait = config.server.restartGraceMs / kMsPerSecond,
					failSafeTimer = setTimeout(function() {
						logger.fatal('Failsafe shutdown. Waiting for open connections to complete (' + secondsToWait + ' s)')
						process.exit(1)
					}, config.server.restartGraceMs)

				// If the timer is the only thing running, do not keep the program running
				failSafeTimer.unref()

				// Stop taking new requests
				server.close()

				// Tell master we are no longer alive (if relevant)
				if (cluster.worker)
					cluster.worker.disconnect()

				// Attempt to use any express error handler
				try {
					next(error)
				}
				catch (expressError) {
					// Express error route borked out. Attempt to send a plain response
					logger.fatal({error: expressError}, 'Express error handler failed')
					res.statusCode = 500
					res.setHeader('Content-Type', 'text/plain')
					res.end('Internal server error')
				}
			}
			catch (error2) {
				console.error('Unable to send express 500 error', error2.stack)	// eslint-disable-line no-console
			}
		})

		// Bind req, res to the domian
		domain.add(req)
		domain.add(res)

		// Pass control onto the remaining express stack
		domain.run(next)
	}

	function addVersionToResponse(req, res, next) {
		res.set(config.headerNames.version, config.package.version)
		next()
	}

	// Redirect HTTP requests to HTTPS
	// http://jaketrent.com/post/https-redirect-node-heroku/
	function forceSSL(req, res, next) {
		let isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https'
		if (isHttps) {
			next()
			return
		}

		res.redirect('https://' + req.get('host') + req.originalUrl)
	}

	function cors() {
		return corser.create({
			methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
			requestHeaders: [...corser.simpleRequestHeaders, config.headerNames.apiToken],
			responseHeaders: [...corser.simpleResponseHeaders, config.headerNames.version]
		})
	}
}
