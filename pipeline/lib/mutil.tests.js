/* eslint-disable no-unused-expressions */

'use strict'

// Core
let fs = require('fs'),
	path = require('path')

// Vendor
let expect = require('chai').expect,
	Promise = require('bluebird')

// Local
let mutil = require('./mutil')

describe('mutil', function() {
	describe('gunzip', function() {
	})

	describe('pathIsYoungerThan', function() {
		let testFile = path.resolve(__dirname, '__test-file__')
		before(() => {
			fs.createWriteStream(testFile).close()
		})
		after(() => {
			fs.unlinkSync(testFile)
		})

		it('test file should be younger than library file', function(done) {
			let timeOutTime = 50
			setTimeout(function() {
				mutil.pathIsYoungerThan(testFile, mutil.durationFromInterval('1 day'))
					.then(function(result) {
						expect(result).true
						return mutil.pathIsYoungerThan(testFile, mutil.durationFromInterval('40 ms'))
					})
					.then(function(result) {
						expect(result).false
						done()
					})
					.catch(done)
			}, timeOutTime)
		})

		it('non-existent file returns false', function() {
			let msNumberOfMiliseconds = 4500
			return mutil.pathIsYoungerThan('this-file-does-not-exist', msNumberOfMiliseconds)
				.then(function(result) {
					expect(result).false
				})
		})
	})

	describe.only('createDeferred', function() {
		it('returns an object with resolve, reject, and the promise', function() {
			let x = mutil.createDeferred()
			expect(x).property('resolve')
			expect(x).property('reject')
			expect(x.promise).instanceof(Promise)
		})

		it('resolve resolves the promise', function() {
			let x = mutil.createDeferred()
			x.resolve(1)
			return x.promise.then((result) => {
				expect(result).equal(1)
			})
		})

		it('reject rejects the promise', function() {
			let x = mutil.createDeferred(),
				catchValue = null,
				succeeded = null
			x.reject(-1)
			return x.promise
			.then((value) => {
				succeeded = true
			})
			.catch((value) => {
				succeeded = false
				catchValue = value
			})
			.finally(() => {
				expect(succeeded).false
				expect(catchValue).equal(-1)
			})
		})
	})
})
