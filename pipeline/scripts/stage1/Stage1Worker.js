'use strict'

class Stage1Worker {
	constructor(config) {
		process.send('ready')
		process.on('message', this.onMessage.bind(this))
	}

	main() {

	}

	onMessage(message) {
		if (/^process\s/.test(message)) {
			let matches = /^process\s+(\S+)/.exec(message)
			if (matches) {
				let refseqAssemblyAccession = matches[1]
				console.log('Ready for', refseqAssemblyAccession)
			}
		}
	}
}

module.exports = Stage1Worker
