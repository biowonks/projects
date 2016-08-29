/* eslint-disable no-console */
'use strict'

// Vendor
const pm2 = require('pm2')

// Local
const config = require('./config')

// Constants
const kDefaultMaxMemory = 512, // MB
	kMaxMemory = process.env.WEB_MEMORY || kDefaultMaxMemory

pm2.connect(() => {
	pm2.start({
		script: 'app.js',
		name: 'mist-api',
		exec_mode: 'cluster',
		instances: config.server.cpus,
		max_memory_restart: kMaxMemory + 'M'
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
				console.log(packet.data)
			})

			bus.on('log:err', (packet) => {
				// console.error('[%s](Error) %s', packet.process.name, packet.data)
				console.log(packet.data)
			})
		})
	})
})
