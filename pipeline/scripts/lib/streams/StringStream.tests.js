/* eslint-disable no-magic-numbers */

'use strict'

let StringStream = require('./StringStream')

describe('Services', function() {
	describe('StringStream', function() {
		it('undefined does not stream any data', function(done) {
			let stringStream = new StringStream(),
				result = 'dummy'
			stringStream.on('data', (string) => {
				result = string
			})
			.on('end', () => {
				expect(result).equal('dummy')
				done()
			})
		})

		it('empty string works', function(done) {
			let stringStream = new StringStream(''),
				result = 'dummy'
			stringStream.on('data', (string) => {
				result = string
			})
			.on('end', () => {
				expect(result).equal('dummy')
				done()
			})
		})

		it('\' \' string works', function(done) {
			let stringStream = new StringStream(' ', {encoding: 'utf8'}),
				result = null
			stringStream.on('data', (string) => {
				result = string
			})
			.on('end', () => {
				expect(result).equal(' ')
				done()
			})
		})

		it('\'abcdef\' works in one pass (buffer size set to 10)', function(done) {
			let stringStream = new StringStream('abcdef', {encoding: 'utf8', highWaterMark: 10}),
				result = null
			stringStream.on('data', (string) => {
				result = string
			})
			.on('end', () => {
				expect(result).equal('abcdef')
				done()
			})
		})

		it('\'1234567890\' works in multiple passes (buffer size set to 3)', function(done) {
			let stringStream = new StringStream('1234567890', {encoding: 'utf8', highWaterMark: 3}),
				nDataCalls = 0,
				result = null
			stringStream.on('data', (string) => {
				if (nDataCalls)
					result += string
				else
					result = string

				nDataCalls++
			})
			.on('end', () => {
				expect(result).equal('1234567890')
				expect(nDataCalls).equal(4)
				done()
			})
		})
	})
})
