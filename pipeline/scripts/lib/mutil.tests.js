'use strict'

// Core includes
let fs = require('fs'),
	path = require('path')
	
// Local includes
let mutil = require('./mutil')

describe.only('mutil', function() {
	describe('download', function() {
		it('missing url throws error', function() {
			return mutil.download()
				.then(() => {
					throw new Error()
				})
				.catch(() => {})
		})
		
		it('download inaccessible url does not create file', function() {
			let destFile = '/tmp/dummy-file'
			
			return mutil.download('http://localhost/dummy-file-that-does-not-exist', destFile)
				.then((result) => {
					fs.unlinkSync(destFile)
					throw new Error()
				})
				.catch(() => {
					return mutil.fileExists(destFile)
				})
				.then((dummyFileExists) => {
					expect(dummyFileExists).false
					return mutil.fileExists(destFile + '.tmp')
				})
				.then((tmpDummyFileExists) => {
					expect(tmpDummyFileExists).false
				})
		})
		
		it('download google.com should to non-existent folder throws error', function() {
			return mutil.download('http://google.com', '/tmp/this/folder/should/not/exit')
				.then((result) => {
					fs.unlinkSync(result.destFile)
					throw new Error()
				})
				.catch(() => {})
		})
		
		it('download google.com to /tmp saves it to /tmp/google.com', function() {
			let destDir = '/tmp',
				destFile = destDir + '/google.com'
			return mutil.download('http://google.com', destDir)
				.then((result) => {
					expect(result).deep.equal({
						url: 'http://google.com',
						destFile: destFile
					})
					
					return mutil.fileNotEmpty(destFile)
				})
				.then((result) => {
					expect(result).true
					return mutil.unlink(destFile)
				})
		})

		it('download google.com to /tmp/google works', function() {
			let destFile = '/tmp/google'
			return mutil.download('http://google.com', destFile)
				.then((result) => {
					expect(result).deep.equal({
						url: 'http://google.com',
						destFile: destFile
					})
					
					return mutil.fileNotEmpty(destFile)
				})
				.then((result) => {
					expect(result).true
					return mutil.unlink(destFile)
				})
		})

		it('download google.com to google', function() {
			let destFile = 'google'
			return mutil.download('http://google.com', destFile)
				.then((result) => {
					expect(result).deep.equal({
						url: 'http://google.com',
						destFile: path.resolve(process.cwd(), destFile)
					})
					
					return mutil.fileNotEmpty(destFile)
				})
				.then((result) => {
					expect(result).true
					return mutil.unlink(destFile)
				})
		})
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
	
	describe('rename', function() {
		let temporaryBaseFileName = 'mutil.tests.tmp',
			temporaryFile = path.resolve(__dirname, temporaryBaseFileName),
			targetFileInSameDir = temporaryFile + '.target',
			targetFileInOtherDir = `/tmp/${temporaryBaseFileName}`

		/**
		 * ${file} may or may not exist, therefore, ignore any error about non-existent files.
		 * 
		 * @param {string} file
		 */
		function ensureUnlinked(file) {
			try {
				fs.unlinkSync(file)
			}
			catch (error) {
				let didNotExist = error.code === 'ENOENT' 
				if (didNotExist)
					return
				
				throw error
			}
		}

		beforeEach(() => {
			fs.createWriteStream(temporaryFile).close()
			ensureUnlinked(targetFileInSameDir)
			ensureUnlinked(targetFileInOtherDir)
		})
		
		afterEach(() => {
			ensureUnlinked(temporaryFile)
			ensureUnlinked(targetFileInSameDir)
			ensureUnlinked(targetFileInOtherDir)
		})

		it('renaming non-existent file throws error', function() {
			let nonExistingFile = path.resolve(__dirname, 'non-existent-test-file'),
				destFile = nonExistingFile + '.tmp'
			return mutil.rename(nonExistingFile, destFile)
				.then(() => {
					throw new Error()
				})
				.catch(() => {
					return mutil.fileExists(destFile)
				})
				.then((destFileExists) => {
					expect(destFileExists).false
				})
		})

		it('rename existing file to non-existent directory throws error', function() {
			let destFile = path.resolve(__dirname, 'non-existent-directory', temporaryBaseFileName)
			return mutil.rename(temporaryFile, destFile)
				.then(() => {
					throw new Error()
				})
				.catch(() => {
					return mutil.fileExists(destFile)
				})
				.then((destFileExists) => {
					expect(destFileExists).false
				})
		})
		
		 it('rename existing file within the same directory', function() {
			 return mutil.rename(temporaryFile, targetFileInSameDir)
			 	.then(() => {
					 return mutil.fileExists(targetFileInSameDir)
				 })
				 .then((targetFileExists) => {
					 expect(targetFileExists).true
					 return mutil.fileExists(temporaryFile)
				 })
				 .then((originalFileExists) => {
					 expect(originalFileExists).false
				 })
		 })
		 
		 it('rename existing file to another directory', function() {
			 return mutil.rename(temporaryFile, targetFileInOtherDir)
			 	.then(() => {
					 return mutil.fileExists(targetFileInOtherDir)
				 })
				 .then((targetFileExists) => {
					 expect(targetFileExists).true
					 return mutil.fileExists(temporaryFile)
				 })
				 .then((originalFileExists) => {
					 expect(originalFileExists).false
				 })
		 })
	})

	describe('shellCommand', function() {
		it('shellCommand waits for the previous promise', function(done) {
			mutil.shellCommand('printf 15')
			.then((result) => {
				console.log(result)
				return mutil.shellCommand('printf ' + (parseInt(result.stdout) + 1))
			})
			.then(function(result) {
				return mutil.shellCommand('printf ' + (parseInt(result.stdout) + 1))			
			})
			.then((result) => {
				expect(result.stdout).equal('17')
				done()
			})
			.catch(done)
		})
	})
})
