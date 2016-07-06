'use strict'

// Core
const assert = require('assert')

// Vendor
const Promise = require('bluebird')

// Local
const DownloadGenomeTask = require('./DownloadGenomeTask'),
	WorkDirectoryTask = require('./WorkDirectoryTask'),
	ParseCoreDataTask = require('./ParseCoreDataTask')

exports.run = function(queuedGenome, context) {
	assert(queuedGenome)

	let taskClasses = [
		WorkDirectoryTask,
		DownloadGenomeTask,
		ParseCoreDataTask
	]

	return Promise.coroutine(function *() {
		for (let TaskClass of taskClasses) {
			context.interruptCheck()

			let task = new TaskClass(queuedGenome, context),
				alreadyDone = yield task.isAlreadyDone()

			if (!alreadyDone) {
				// In the event that the task throws an error while running, give it an opportunity
				// to clean up.
				try {
					yield task.setup()
					yield task.run()
				}
				catch (error) {
					yield task.teardown()
					throw error
				}
				yield task.teardown()
			}
		}
	})()
}
