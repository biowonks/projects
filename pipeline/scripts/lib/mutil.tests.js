/* eslint-disable no-unused-expressions */

'use strict'

let fs = require('fs'),
	path = require('path')

let expect = require('chai').expect

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
})
