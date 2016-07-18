'use strict'

// Core
const os = require('os')

module.exports =
class WorkerService {
	constructor(models, publicIP) {
		this.models_ = models
		this.publicIP_ = publicIP
	}

	buildWorker(optMessage = null) {
		return this.models_.Worker.build({
			hostname: os.hostname(),
			process_id: process.pid,
			public_ip: this.publicIP_,
			active: true,
			message: optMessage
		})
	}
}
