/* eslint-disable no-console */
'use strict'

// Vendor
const pm2 = require('pm2')

// Local
const config = require('./config')

pm2.connect(() => {
	pm2.start({
		name: 'mist-api',
		script: 'app.js',
		execMode: 'cluster',
		instances: config.server.cpus,
		maxMemoryRestart: config.server.maxMemory + 'M',
		killTimeout: config.server.killTimeoutMs,
		restartDelay: config.server.restartDelayMs,
		watch: config.server.watch
	}, (startError) => {
		if (startError) {
			console.error('Error while launching applications', startError.stack || startError)
			return
		}

		console.log('PM2 and application have been successfully started')
		pm2.launchBus((error, bus) => {
			if (error)
				throw error

			console.log('[PM2] Log streaming started')

			bus.on('log:out', (packet) => {
				// console.log('[%s] %s', packet.process.name, packet.data)
				process.stdout.write(packet.data)
			})

			bus.on('log:err', (packet) => {
				// console.error('[%s](Error) %s', packet.process.name, packet.data)
				process.stderr.write(packet.data)
			})
		})
	})
})
