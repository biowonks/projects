/* eslint-disable global-strict, strict */
// For readability purposes, the startWorker method is not placed at
// the top of the file (as required by the use strict flag). Thus,
// there is no 'use strict' clause, which if present causes node to
// die.
//
// On the other hand, eslint requires that each file declare 'use strict'
// But we are making an exception here, so thus the above eslint-disable
// clause.

var cluster = require('cluster');

var config = require('./config'),
	loggerService = require('./services/logger-service');

var logger = loggerService(config.logger.options);

// --------------------------------------------------------
if (cluster.isMaster) {
	var delayMs = 0;
	function startWorker() {
		var nWorkers = Object.keys(cluster.workers).length;
		if (nWorkers === config.server.cpus)
			return;

		// Start one worker at a time - this avoids hitting the database
		// too many times unnecessarily.
		setTimeout(function() {
			var worker = cluster.fork();
			worker.on('message', function(message) {
				if (message === 'error db') {
					cluster.disconnect(function() {
						console.error('\nFATAL: Database initialization error. Please check the logs and restart the application');
						process.exit(2);
					});
					return;
				}

				if (message === 'success')
					delayMs = 0;
				startWorker();
			});
		}, delayMs);
	}
	startWorker();

	cluster.on('exit', function(worker, code, signal) {
		logger.fatal({pid: worker.process.pid, code: code, signal: signal}, 'Worker instance died');

		if (config.server.restartOnCrash) {
			delayMs = Math.min(30000, Math.max(100, delayMs * 2));
			logger.info({delay: delayMs}, 'Restarting in ' + delayMs + 'ms');
			startWorker();
		}
		else {
			cluster.disconnect(function() {
				process.exit(2);
			});
		}
	});
}

// --------------------------------------------------------
if (cluster.isWorker)
	require('./app')();
