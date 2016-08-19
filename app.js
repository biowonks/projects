'use strict'

// Core
let	cluster = require('cluster'),
	http = require('http')

// Vendor
let bodyParser = require('body-parser'),
	compression = require('compression'), // Gzip support
	corser = require('corser'), // CORS
	express = require('express'),
	helmet = require('helmet'), // Security practices
	httpShutdown = require('http-shutdown'),
	pathRoutify = require('path-routify')

// Local
let	errorHandler = require('./lib/error-handler'),
	loadServices = require('./services'),
	ApiError = require('./lib/errors/api-error'),
	BootService = require('./services/BootService'),
	CriteriaError = require('./lib/errors/criteria-error'),
	RestError = require('./lib/errors/rest-error'),
	RouteHelper = require('./lib/RouteHelper')

// Constants
const kMsPerSecond = 1000,
	kJsonPrettyPrintSpaces = 2

// Other
function exit(code = 0) {
	process.exit(code)
}

module.exports = function() {
	// Maintain reference to server variable because the handleUncaughtErrors middleware references it.
	let server = null,
		bootService = new BootService({
			logger: {
				workerId: cluster.worker.id
			}
		}),
		logger = bootService.logger(),
		config = BootService.config,
		sigTermSignalReceived = false,
		failedSetup = false

	process.on('message', (message) => {
		if (message === 'SIGTERM')
			onSigTerm()
	})

	return bootService.setup()
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
		// Add in some good security measures
		app.use(helmet())

		// Use the native queryparser module (vs the qs module). Thus, nested objects are no longer
		// automaticallky constructed when brackets are used in the query string.
		app.set('query parser', 'simple')

		// http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api#pretty-print-gzip
		// Gzip output and pretty print JSON by default
		app.use(compression())
		app.set('json spaces', kJsonPrettyPrintSpaces)

		app.set('errors', {ApiError, CriteriaError, RestError})
		app.set('config', config)
		app.set('logger', logger)
		app.set('sequelize', bootService.sequelize())
		app.set('models', bootService.models())

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
		app.set('lib', {
			RouteHelper
		})

		let router = pathRoutify(app, config.routing.routesPath, {
			autoNameAnonymousMiddleware: true, // helps when debugging errors
			middlewaresPath: config.routing.middlewaresPath,
			logger // Log all generated routes
		})
		if (config.routing.prefix)
			app.use(config.routing.prefix, router)
		else
			app.use(router)

		app.use(handleUncaughtErrors)
		app.use(errorHandler(app))

		server = http.createServer(app)
		server = httpShutdown(server)
		server.listen(config.server.port, () => {
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

		if (!server)
			exit()

		// Close down any keep-alive connections
		// https://github.com/nodejs/node-v0.x-archive/issues/9066
		logger.info(`Received SIGTERM signal from master. Waiting ${config.server.workerExitGraceMs / kMsPerSecond} seconds for open connections to complete`)
		server.shutdown(() => {
			logger.info('All connections done, exiting normally')
			exit()
		})

		let failSafeTimer = setTimeout(() => {
			logger.fatal('Timed out waiting for open connections to close normally, forcefully exiting')
			exit(1)
		}, config.server.workerExitGraceMs)

		failSafeTimer.unref()
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
