/* eslint-disable no-unused-expressions, no-magic-numbers */

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

	describe('createDeferred', function() {
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

	describe('sequence', function() {
		it('by default, should monotonically increase starting from 1 by 1', function() {
			let x = mutil.sequence()
			expect(x.next().value).equal(1)
			expect(x.next().value).equal(2)
			expect(x.next().value).equal(3)
		})

		it('specifying a different initial index begins with that value', function() {
			let x = mutil.sequence(5)
			expect(x.next().value).equal(5)
			expect(x.next().value).equal(6)
		})

		it('changes by user specified delta', function() {
			let x = mutil.sequence(1, 2)
			expect(x.next().value).equal(1)
			expect(x.next().value).equal(3)

			x = mutil.sequence(1, -2)
			expect(x.next().value).equal(1)
			expect(x.next().value).equal(-1)
		})
	})

	describe('parseAccessionVersion', function() {
		it('returns [] if no accession', function() {
			expect(mutil.parseAccessionVersion()).deep.equal([])
		})

		it('returns [] if null accession', function() {
			expect(mutil.parseAccessionVersion(null)).deep.equal([])
		})

		it('returns [accession, null] if not suffixed with a version number', function() {
			expect(mutil.parseAccessionVersion('NC_019232')).deep.equal([
				'NC_019232',
				null
			])
			expect(mutil.parseAccessionVersion('NC_019232.')).deep.equal([
				'NC_019232',
				null
			])
		})

		it('returns both accession and version', function() {
			expect(mutil.parseAccessionVersion('NC_019234.1')).deep.equal([
				'NC_019234',
				1
			])
			expect(mutil.parseAccessionVersion('NC_019234.2')).deep.equal([
				'NC_019234',
				2
			])
			expect(mutil.parseAccessionVersion('.1')).deep.equal([
				'',
				1
			])
		})
	})
})
