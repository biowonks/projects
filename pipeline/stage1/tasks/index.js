'use strict'

// Core
const assert = require('assert')

// Vendor
const Promise = require('bluebird')

// Local
const DownloadGenomeTask = require('./DownloadGenomeTask'),
	WorkDirectoryTask = require('./WorkDirectoryTask')

exports.run = function(queuedGenome, context) {
	assert(queuedGenome)

	let taskClasses = [
		WorkDirectoryTask,
		DownloadGenomeTask
	]

	return Promise.coroutine(function *() {
		for (let TaskClass of taskClasses) {
			context.interruptCheck()

			let task = new TaskClass(queuedGenome, context)

			yield task.setup()
			if (yield task.isAlreadyDone())
				continue
			yield task.run()
			yield task.teardown()
		}
	})()
}
