'use strict'

// Core
const fs = require('fs')

// Vendor
const temp = require('temp'),
	Promise = require('bluebird')

// Local
const streamMixins = require('./stream-mixins')

// Constants
const kTimeoutMs = 3000

describe('streams', function() {
	describe('writePromise mixin', function() {
		let tempPath = null
		beforeEach(() => {
			tempPath = temp.path()
		})
		afterEach(() => {
			try {
				fs.unlinkSync(tempPath)
			}
			catch (error) {} // eslint-disable-line no-empty
		})

		it('returns a promise', function() {
			let x = fs.createWriteStream(tempPath)
			streamMixins.writePromise(x)
			expect(x.writePromise('text')).instanceof(Promise)
		})

		it('drain calls resolve', function() {
			let x = fs.createWriteStream(tempPath, {highWaterMark: 1})
			streamMixins.writePromise(x)
			return x.writePromise('a long line of text that will surpass the highwater mark')
		})

		it('callback is still called', function(done) {
			let x = fs.createWriteStream(tempPath, {highWaterMark: 1}),
				failSafeTimer = setTimeout(() => {
					done(new Error('Write timed out'))
				}, kTimeoutMs)

			streamMixins.writePromise(x)

			x.writePromise('a long line of text that will surpass the highwater mark', 'utf8', () => {
				clearTimeout(failSafeTimer)
				done()
			})
		})

		describe('endPromise mixin', function() {
			it('returns a promise', function() {
				let x = fs.createWriteStream(tempPath)
				streamMixins.endPromise(x)
				expect(x.endPromise()).instanceof(Promise)
			})
		})
	})
})
