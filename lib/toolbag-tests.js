'use strict';

var path = require('path'),
	expect = require('chai').expect;

var toolbag = require('./toolbag');

describe('toolbag', function() {
	describe('directoryList', function() {
		it('should return a list of directories in test-dirs',
		function() {
			expect(toolbag.directoryList(path.resolve(__dirname, 'test-dirs'))).deep.equal(['alpha', 'beta']);
		});
	});

	describe('fileExists', function() {
		it('should return TRUE for toolbag.js',
		function() {
			expect(toolbag.fileExists(path.resolve(__dirname, 'toolbag.js'))).true;
		});

		it('should return FALSE for non-existent-file.js',
		function() {
			expect(toolbag.fileExists(path.resolve(__dirname, 'non-existent-file.js'))).false;
		});
	});

	describe('isDirectory', function() {
		it('should return TRUE for test-dirs',
		function() {
			expect(toolbag.isDirectory(path.resolve(__dirname, 'test-dirs'))).true;
		});

		it('should return FALSE for toolbag.js',
		function() {
			expect(toolbag.isDirectory(path.resolve(__dirname, 'toolbag-tests.js'))).false;
		});

		it('should return FALSE for non-existent file',
		function() {
			expect(toolbag.isDirectory(path.resolve(__dirname, 'non-existent-file'))).false;
		});
	});

	describe('pathIsLoadable', function() {
		it('should return TRUE for test-dirs/alpha',
		function() {
			expect(toolbag.pathIsLoadable(path.resolve(__dirname, 'test-dirs', 'alpha'))).true;
		});

		it('should return FALSE for test-dirs',
		function() {
			expect(toolbag.pathIsLoadable(path.resolve(__dirname, 'test-dirs'))).false;
		});
	});
});
