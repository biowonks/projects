'use strict'

let fs = require('fs'),
	path = require('path')

let expect = require('chai').expect

let mutil = require('./mutil')

describe('mutil', function() {
	describe('pathIsYoungerThan', function() {
		let testFile = path.resolve(__dirname, '__test-file__')
		before(() => {
			fs.createWriteStream(testFile).close()
		})
		after(() => {
			fs.unlinkSync(testFile)
		})

		it('test file should be younger than library file', function(done) {
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
			}, 50);
		})

		it('non-existent file returns false', function() {
			return mutil.pathIsYoungerThan('this-file-does-not-exist', 4500)
				.then(function(result) {
					expect(result).false
				});
		})
	})
})
