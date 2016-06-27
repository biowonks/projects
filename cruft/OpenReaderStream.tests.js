/* eslint-disable no-new, no-unused-expressions, no-magic-numbers */

'use strict'

// Vendor
let Promise = require('bluebird')

// Local
let OpenReaderStream = require('./OpenReaderStream')

describe('Streams', function() {
	describe('OpenReaderStream', function() {
		it('constructs normally', function() {
			new OpenReaderStream()
		})

		it('push returns a Promise', function() {
			let x = new OpenReaderStream()
			expect(x.push('ATG')).instanceof(Promise)
		})

		it('push() returns null', function() {
			let x = new OpenReaderStream()
			expect(x.push()).null
		})

		it('push(null) returns null', function() {
			let x = new OpenReaderStream()
			expect(x.push(null)).null
		})

		it('push(\'\') returns null', function() {
			let x = new OpenReaderStream()
			expect(x.push('')).null
		})

		it('throws error if push called after closeInput', function(done) {
			let x = new OpenReaderStream()
			x.closeInput()
			x.on('error', () => {
				done()
			})
			.on('end', () => {
				done(new Error('Expected error to be thrown'))
			})
			x.push('')
		})

		it('push promise is rejected if push called after closeInput', function() {
			let x = new OpenReaderStream(),
				promise = x.push('ATG')
			x.closeInput()
			x.on('error', () => {}) // Swallow the emit error
			x.push('GTA')
			return expectRejection(promise)
		})

		it('push promise is resolved after it is consumed', function() {
			let x = new OpenReaderStream(),
				promise = x.push('ATG')

			x.on('data', () => {})
			return promise
		})

		it('push(ACGT) is received in single calls', function(done) {
			let x = new OpenReaderStream({highWaterMark: 10})

			x.push('ACGT')

			x
			.on('error', done)
			.on('data', (buffer) => {
				expect(buffer.toString()).equal('ACGT')
				done()
			})
		})

		it('push(ACGT) is received in multiple calls', function(done) {
			let x = new OpenReaderStream({highWaterMark: 2}),
				numDataEvents = 0,
				result = ''

			x.push('ACGT')
			x.closeInput()

			x
			.on('error', done)
			.on('data', (buffer) => {
				result += buffer
				numDataEvents++
			})
			.on('end', () => {
				expect(result).equal('ACGT')
				expect(numDataEvents).equal(2)
				done()
			})
		})

		it('closeInput() with empty buffer ends stream', function(done) {
			let x = new OpenReaderStream()
			x.closeInput()

			x.on('error', done)
			.on('data', () => {
				done(new Error('Did not expect to receive any data'))
			})
			.on('end', () => {
				done()
			})
		})
	})
})
