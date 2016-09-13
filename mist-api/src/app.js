'use strict'

// Core
const http = require('http')

// Vendor
const bodyParser = require('body-parser'),
	compression = require('compression'), // Gzip support
	corser = require('corser'), // CORS
	express = require('express'),
	helmet = require('helmet'), // Security practices
	httpShutdown = require('http-shutdown'),
	pathRoutify = require('path-routify'),
	responseTime = require('response-time')

// Local
const config = require('../config'),
	errorHandler = require('lib/error-handler'),
	loadServices = require('./services'),
	errors = require('lib/errors'),
	BootService = require('mist-lib/services/BootService'),
	RouteHelper = require('lib/RouteHelper')

// Constants
const kMsPerSecond = 1000,
	kJsonPrettyPrintSpaces = 2,
	kErrorExitCode = 1

// Maintain reference to server variable because the handleUncaughtErrors middleware references it.
let server = null,
	bootService = new BootService(config.database, {
		logger: {
			name: 'mist-api',
			streams: [
				{
					level: 'info',
					stream: process.stdout
				}
			]
		}
	}),
	logger = bootService.logger(),
	shutdownRequestReceived = false

process.on('SIGINT', shutdown) // React to user interruptions (e.g. Ctrl-C)
process.on('SIGTERM', shutdown) // React to termination requests (e.g. Heroku)
process.on('message', (message) => {
	if (message === 'shutdown')
		shutdown()
})

bootService.setup()
.catch(function(error) {
	logger.fatal(error, 'Unable to setup database: ' + error.message)
	exit(kErrorExitCode)
})
.then(function(sequelize) {
	// --------------------------------------------------------
	// Main setup
	let app = express()
	app.use(helmet()) // Security measures

	// Use the native queryparser module (vs the qs module). Thus, nested objects are no longer
	// automaticallky constructed when brackets are used in the query string.
	app.set('query parser', 'simple')

	// http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api#pretty-print-gzip
	// Gzip output and pretty print JSON by default
	app.use(compression())
	app.set('json spaces', kJsonPrettyPrintSpaces)

	app.set('errors', errors)
	app.set('config', config)
	app.set('logger', logger)
	app.set('sequelize', bootService.sequelize())
	app.set('models', bootService.models())

	if (config.responseTime.enabled) {
		app.use(responseTime((req, res, time) => {
			logger.info({url: req.originalUrl, responseTime: time, httpMethod: req.method, statusCode: res.statusCode}, `${res.statusCode} - ${req.method.toUpperCase()} ${req.originalUrl}: ${time.toFixed(1)} ms`)
			res.header('X-Response-Time', time)
		}))
	}

	if (config.routing.ssl)
		app.use(throwErrorIfNotSSL)

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

	app.use(errorHandler(app))

	if (shutdownRequestReceived)
		return

	server = http.createServer(app)
	server = httpShutdown(server)
	server.listen(config.server.port, () => {
		logger.info({port: config.server.port}, 'Listening for connections')
	})
})


// --------------------------------------------------------
function shutdown() {
	if (!server) {
		logger.info('Server not yet started. Exiting normally.')
		exit()
		return
	}

	if (shutdownRequestReceived) {
		logger.info('Multiple shutdown requests received. Forcefully quitting')
		exit(kErrorExitCode)
		return
	}

	shutdownRequestReceived = true

	// Close down any keep-alive connections
	// https://github.com/nodejs/node-v0.x-archive/issues/9066
	logger.info(`Waiting ${config.server.killTimeoutMs / kMsPerSecond} seconds for open connections to complete`)
	server.shutdown(() => {
		logger.info('All connections done, exiting normally')
		exit()
	})

	let failSafeTimer = setTimeout(() => {
		logger.fatal('Timed out waiting for open connections to close normally, forcefully exiting')
		exit(kErrorExitCode)
	}, config.server.killTimeoutMs)

	failSafeTimer.unref()
}

// --------------------------------------------------------
function exit(code = 0) {
	// HACK way of flushing stdout before exiting. See:
	// https://github.com/nodejs/node/issues/6456
	//
	// The extra newline is simply to give stdout something to write
	process.stdout.write('\n', () => {
		process.exit(code)
	})
}

// --------------------------------------------------------
// Middlewares
function addVersionToResponse(req, res, next) {
	res.set(config.headerNames.version, config.package.version)
	next()
}

// Redirect HTTP requests to HTTPS
// http://jaketrent.com/post/https-redirect-node-heroku/
function throwErrorIfNotSSL(req, res, next) {
	let isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https'
	if (isHttps) {
		next()
		return
	}

	throw errors.sslRequiredError
}

function cors() {
	return corser.create({
		methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
		requestHeaders: [...corser.simpleRequestHeaders, config.headerNames.apiToken],
		responseHeaders: [...corser.simpleResponseHeaders, config.headerNames.version]
	})
}
