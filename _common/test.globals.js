/**
 * For convenience purposes, the following are placed on the global name space:
 *   expect
 *   expectRejection
 */

'use strict'

global.expect = require('chai').expect
global.sinon = require('sinon')

/**
 * Convenience method for testing that ${promise} is rejected.
 *
 * @param {Promise} promise
 * @returns {Promise}
 */
global.expectRejection = function(promise) {
	let succeeded = null

	return promise
	.then(() => {
		succeeded = true
	})
	.catch(() => {
		succeeded = false
	})
	.finally(() => {
		expect(succeeded).false // eslint-disable-line no-unused-expressions
	})
}
