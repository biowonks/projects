/* eslint-disable global-strict, strict */
/**
 * For readability purposes, the startWorker method is not placed at the top of the file (as
 * required by the use strict flag). Thus, there is no 'use strict' clause, which if present
 * causes node to die.
 *
 * On the other hand, eslint requires that each file declare 'use strict'. This is an
 * exception here, so thus the above eslint-disable clause.
 */

// Core
let cluster = require('cluster')

// Local
let BootStrapper = require('./services/BootStrapper')

// Constants
const kAppExitCode = 2,
	kMinRestartDelayMs = 100,
	kMaxRestartDelayMs = 30000, // 30 seconds
	kRestartDelayFactor = 2 // Double each crash

// --------------------------------------------------------
if (cluster.isMaster) {
	// Here, the boot strapper is really not doing much besides providing a common and consistent
	// mechanism for obtaining the configuration and a logger instance. It's other functionality
	// (e.g. connecting to the database) is leveraged inside the app.js and other external
	// scripts.
	let bootStrapper = new BootStrapper(),
		config = BootStrapper.config,
		logger = bootStrapper.logger(),
		restartDelayMs = 0

	function startWorker() {
		let nWorkers = Object.keys(cluster.workers).length
		if (nWorkers === config.server.cpus)
			return

		// Start one worker at a time and wait for the worker to signal it has been successfully
		// started. Because each worker connects to the database at startup, this avoids overloading
		// the database when scaling out N number of workers.
		setTimeout(() => {
			let worker = cluster.fork()
			worker.on('message', (message) => {
				if (message === 'error db') {
					cluster.disconnect(() => {
						logger.fatal('Database initialization error. Please check the logs and restart the application')
						process.exit(kAppExitCode)
					})
					return
				}

				if (message === 'success')
					restartDelayMs = 0
				startWorker()
			})
		}, restartDelayMs)
	}
	startWorker()

	cluster.on('exit', (worker, code, signal) => {
		logger.fatal({pid: worker.process.pid, code, signal}, 'Worker instance died')

		if (config.server.restartOnCrash) {
			restartDelayMs = Math.min(kMaxRestartDelayMs, Math.max(kMinRestartDelayMs, restartDelayMs * kRestartDelayFactor))
			logger.info({restartDelayMs}, `Restarting in ${restartDelayMs} ms`)
			startWorker()
		}
		else {
			cluster.disconnect(() => {
				process.exit(kAppExitCode)
			})
		}
	})
}

// --------------------------------------------------------
if (cluster.isWorker)
	require('./app')() // eslint-disable-line global-require
