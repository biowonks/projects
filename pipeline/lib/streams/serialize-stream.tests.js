/* eslint-disable no-magic-numbers */

'use strict'

// Local
let serializeStream = require('./serialize-stream')

let createMockObject = function() {
	return {
		toString: () => {
			return 'toString was called\n'
		}
	}
}

describe('streams', function() {
	describe('serialize stream', function() {
		function writeAndExpect(inputs, expectedOutput, done, ...serializeArgs) {
			let x = serializeStream(...serializeArgs),
				result = ''

			for (let input of inputs)
				x.write(input)
			x.end()

			x.on('error', done)
			.on('data', (chunk) => {
				result += chunk
			})
			.on('end', () => {
				expect(result).equal(expectedOutput)
				done()
			})
		}

		it('no arguments uses toString() for serialization', function(done) {
			writeAndExpect([{}, '\n', createMockObject()], '[object Object]\ntoString was called\n', done)
		})

		it('accepts a serialize function', function(done) {
			function convert(object, encoding) {
				return 'convert!\n'
			}

			writeAndExpect(
				[{}, ''],
				'convert!\n'.repeat(2),
				done,
				convert
			)
		})

		it('accepts options and serialize function', function(done) {
			function squawk() {
				return 'squawk'
			}

			writeAndExpect([
				1,
				'abc'
			], 'squawk'.repeat(2), done, {highWaterMark: 1}, squawk)
		})
	})
})
