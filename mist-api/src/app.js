'use strict';

// ----------------------
// ----------------------
// Monitoring by NewRelic
if (process.env.NEW_RELIC_LICENSE_KEY) {
  console.log('Loading New Relic'); // eslint-disable-line no-console
  require('newrelic'); // eslint-disable-line global-require
}
// ----------------------
// ----------------------

// Core
const http = require('http');

// Vendor
const bodyParser = require('body-parser');
const compression = require('compression'); // Gzip support
const corser = require('corser'); // CORS
const express = require('express');
const helmet = require('helmet'); // Security practices
const httpShutdown = require('http-shutdown');
const pathRoutify = require('path-routify');
const responseTime = require('response-time');
const onHeaders = require('on-headers');

// Local
const config = require('../config');
const errorHandler = require('lib/error-handler');
const coreHeaderNames = require('core-lib/header-names');
const loadServices = require('./services');
const errors = require('lib/errors');
const latestDocs = require('./routes/docs/use');
const MistBootService = require('mist-lib/services/MistBootService');
const RouteHelper = require('lib/RouteHelper');
const { NoContent } = require('lib/http-status-codes');

// Constants
const kMsPerSecond = 1000;
const kJsonPrettyPrintSpaces = 2;
const kErrorExitCode = 1;

// Maintain reference to server variable because the handleUncaughtErrors middleware references it.
let server = null;
const bootService = new MistBootService({
  applicationName: 'mist-api',
  logger: {
    name: 'mist-api',
    streams: [
      {
        level: 'info',
        stream: process.stdout,
      },
    ],
  },
});
const logger = bootService.logger();
let shutdownRequestReceived = false;

process.on('SIGINT', shutdown); // React to user interruptions (e.g. Ctrl-C)
process.on('SIGTERM', shutdown); // React to termination requests (e.g. Heroku)
process.on('message', (message) => {
  if (message === 'shutdown') {
    shutdown();
  }
});

bootService.setup()
  .catch(function(error) {
    logger.fatal(error, 'Unable to setup database: ' + error.message);
    exit(kErrorExitCode);
  })
  .then(function(sequelize) {
    // --------------------------------------------------------
    // Main setup
    let app = express();
    app.use(helmet()); // Security measures

    // If we have any open transaction - commit it
    app.use((req, res, next) => {
      onHeaders(res, () => {
        if (res.locals.criteria && res.locals.criteria.transaction) {
          res.locals.criteria.transaction.commit();
        }
      });
      next();
    });

    // Use the native queryparser module (vs the qs module). Thus, nested objects are no longer
    // automaticallky constructed when brackets are used in the query string.
    app.set('query parser', 'simple');

    // http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api#pretty-print-gzip
    // Gzip output and pretty print JSON by default
    app.use(compression());
    app.set('json spaces', kJsonPrettyPrintSpaces);

    app.set('errors', errors);
    app.set('config', config);
    app.set('logger', logger);
    app.set('sequelize', bootService.sequelize());
    app.set('models', bootService.models());

    if (config.responseTime.enabled) {
      app.use(responseTime((req, res, time) => {
        logger.info({url: req.originalUrl, responseTime: time, httpMethod: req.method, statusCode: res.statusCode}, `${res.statusCode} - ${req.method.toUpperCase()} ${req.originalUrl}: ${time.toFixed(1)} ms`);
        res.header('X-Response-Time', time);
      }));
    }

    if (config.routing.ssl) {
      app.use(throwErrorIfNotSSL);
    }

    if (config.cors.enabled) {
      logger.info('Enabling CORS');
      app.use(cors());
    }

    app.use(addVersionToResponse);
    app.use(bodyParser.json());

    app.set('services', loadServices(app));
    app.set('lib', {
      RouteHelper,
    });

    let router = pathRoutify(app, config.routing.routesPath, {
      autoNameAnonymousMiddleware: true, // helps when debugging errors
      middlewaresPath: config.routing.middlewaresPath,
      logger, // Log all generated routes
    });
    if (config.routing.prefix) {
      app.use(config.routing.prefix, router);
    }
    else {
      app.use(router);
    }

    // For the time being, ignore all favicon requests
    app.get('/favicon.ico', (req, res) => {
      res.status(NoContent);
    });
    app.use('/', latestDocs());

    app.use(errorHandler(app));

    if (shutdownRequestReceived) {
      return;
    }

    server = http.createServer(app);
    server = httpShutdown(server);
    server.listen(config.server.port, () => {
      logger.info({port: config.server.port}, 'Listening for connections');
    });
  });


// --------------------------------------------------------
function shutdown() {
  if (!server) {
    logger.info('Server not yet started. Exiting normally.');
    exit();
    return;
  }

  if (shutdownRequestReceived) {
    logger.info('Multiple shutdown requests received. Forcefully quitting');
    exit(kErrorExitCode);
    return;
  }

  shutdownRequestReceived = true;

  // Close down any keep-alive connections
  // https://github.com/nodejs/node-v0.x-archive/issues/9066
  logger.info(`Waiting ${config.server.killTimeoutMs / kMsPerSecond} seconds for open connections to complete`);
  server.shutdown(() => {
    logger.info('All connections done, exiting normally');
    exit();
  });

  const failSafeTimer = setTimeout(() => {
    logger.fatal('Timed out waiting for open connections to close normally, forcefully exiting');
    exit(kErrorExitCode);
  }, config.server.killTimeoutMs);

  failSafeTimer.unref();
}

// --------------------------------------------------------
function exit(code = 0) {
  // HACK way of flushing stdout before exiting. See:
  // https://github.com/nodejs/node/issues/6456
  //
  // The extra newline is simply to give stdout something to write
  process.stdout.write('\n', () => {
    process.exit(code);
  });
}

// --------------------------------------------------------
// Middlewares
function addVersionToResponse(req, res, next) {
  res.set(config.headerNames.version, config.package.version);
  next();
}

// Redirect HTTP requests to HTTPS
// http://jaketrent.com/post/https-redirect-node-heroku/
function throwErrorIfNotSSL(req, res, next) {
  let isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
  if (isHttps) {
    next();
    return;
  }

  throw errors.sslRequiredError;
}

function cors() {
  const coreHeaders = Object.keys(coreHeaderNames).map((key) => coreHeaderNames[key]);

  return corser.create({
    methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    requestHeaders: [...corser.simpleRequestHeaders, config.headerNames.apiToken],
    responseHeaders: [...corser.simpleResponseHeaders, config.headerNames.version, ...coreHeaders],
  });
}
