/* eslint-disable global-strict, strict */
/**
 * For readability purposes, the startWorker method is not placed at the top of the file (as
 * required by the use strict flag). Thus, there is no 'use strict' clause, which if present
 * causes node to die.
 *
 * On the other hand, eslint requires that each file declare 'use strict'. This is an
 * exception here, so thus the above eslint-disable clause.
 *
 * TODO: look into strongloop clustering
 */

// Core
let cluster = require('cluster')

// Local
let BootStrapper = require('./services/BootStrapper')

// Constants
const kAppExitCode = 2,
	kMinRestartDelayMs = 100,
	kMaxRestartDelayMs = 30000, // 30 seconds
	kShutdownGraceMs = 30000, // 30 seconds
	kRestartDelayFactor = 2 // Double each crash

// --------------------------------------------------------
// --------------------------------------------------------
if (cluster.isMaster) {
	// Here, the boot strapper is really not doing much besides providing a common and consistent
	// mechanism for obtaining the configuration and a logger instance. It's other functionality
	// (e.g. connecting to the database) is leveraged inside the app.js and other external
	// scripts.
	let bootStrapper = new BootStrapper(),
		config = BootStrapper.config,
		logger = bootStrapper.logger().child({module: 'cluster-master'}),
		restartDelayMs = 0,
		numShutDownRequests = 0,
		restartTimer = null

	process.on('SIGTERM', shutdown)
	process.on('SIGINT', shutdown)

	startWorker()

	// ----------------------------------------------------
	cluster.on('exit', (worker, code, signal) => {
		let isNormalExit = code === 0,
			context = {pid: worker.process.pid, code, signal}

		if (isNormalExit)
			logger.info(context, 'Worker exited normally')
		else
			logger.fatal(context, 'Worker died')

		if (numShutDownRequests) {
			if (numWorkers() === 0) {
				logger.info('All workers have exited')
				disconnectAndExit()
			}
		}
		else if (config.server.restartAutomatically) {
			let newDelayMs = Math.min(kMaxRestartDelayMs, Math.max(kMinRestartDelayMs, restartDelayMs * kRestartDelayFactor))
			startWorker(newDelayMs)
		}
		else {
			disconnectAndExit(kAppExitCode)
		}
	})

	function startWorker(optDelayMs = 0) {
		if (restartTimer)
			return

		restartDelayMs = optDelayMs
		if (restartDelayMs)
			logger.info({restartDelayMs}, `Restarting in ${restartDelayMs} ms`)

		// Serially start workers one at a time. Wait for the worker to signal it has
		// successfully started before starting the next one. Because each worker connects to the
		// database at startup, this avoids overloading the database when scaling out N number of
		// workers.
		restartTimer = setTimeout(() => {
			restartTimer = null

			if (numShutDownRequests || numWorkers() >= config.server.cpus)
				return

			let worker = cluster.fork()
			worker.on('message', (message) => {
				if (message === 'error db') {
					logger.fatal('Database initialization error. Please check the logs and restart the application')
					disconnectAndExit(kAppExitCode)
				}
				else if (message === 'ready') {
					logger.info('Worker is ready')
					startWorker()
				}
				else {
					logger.info(`Unhandled message from worker: ${message}`)
				}
			})

			logger.info({totalWorkers: numWorkers()}, 'Started worker')
		}, restartDelayMs)
	}

	function numWorkers() {
		return Object.keys(cluster.workers).length
	}

	function shutdown() {
		logger.info('Shutdown request received')

		clearTimeout(restartTimer)
		restartTimer = null

		if (numWorkers() === 0) {
			disconnectAndExit()
			return
		}

		++numShutDownRequests
		if (numShutDownRequests > 1) {
			logger.fatal('Another shutdown request received. Forcefully shutting down.')
			forcefulShutdown()
		}

		// Signal each worker to stop receiving connections and gracefully shutdown
		for (let id in cluster.workers)
			cluster.workers[id].send('SIGTERM')

		let shutdownTimer = setTimeout(() => {
			logger.fatal('Workers did not exit within the grace period, forcefully exiting.')
			forcefulShutdown()
		}, kShutdownGraceMs)

		shutdownTimer.unref()
	}

	function disconnectAndExit(exitCode = 0) {
		cluster.disconnect(() => {
			process.exit(exitCode)
		})
	}

	function forcefulShutdown() {
		process.exit(kAppExitCode)
	}
}

// --------------------------------------------------------
// --------------------------------------------------------
if (cluster.isWorker) {
	// Swallow the interrupt and terminate signals; shutting down the child processes is handled
	// by message passing from the master.
	let noop = () => {}
	process.on('SIGINT', noop)
	process.on('SIGTERM', noop)

	require('./app')() // eslint-disable-line global-require
}
