/* eslint-disable no-magic-numbers */

'use strict'

// Local
const StopWatch = require('./StopWatch')

describe('StopWatch', function() {
	it('throws error if elapsedSeconds called before calling start', function() {
		let x = new StopWatch()
		expect(function() {
			x.elapsedSeconds()
		}).throw(Error)
	})

	it('measures time', function(done) {
		let x = new StopWatch()
		x.start()
		setTimeout(function() {
			expect(x.elapsedSeconds()).above(.05)
			x.stop()

			let firstElapsed = x.elapsedSeconds()

			setTimeout(function() {
				let secondElapsed = x.elapsedSeconds()
				expect(firstElapsed).equal(secondElapsed)
				done()
			}, 10)
		}, 60)
	})
})
