/**
 * Testing of the API leverages the following libraries:
 *   mocha: JavaScript test framework
 *   chai: BDD / TDD assertion library
 *   sinon: spies, stubs, and mocks
 *   supertest-as-promised: promise based http assertions
 *
 * Initializes running tests and common setup routines. This file should be required by the
 * mocha binary when running any tests:
 *
 *   $ ./mocha -r test-setup.js <test-file> ...
 *
 * For convenience purposes, the following are placed on the global name space:
 *   expect
 *   sinon
 *   expectRejection
 *
 * For database tests, the same core database is used; however, all results are done within a
 * distinct schema (e.g. 'test') vs the default public schema. Instead of dropping and recreating
 * the database each time, simply clone the source database schema into test.
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
