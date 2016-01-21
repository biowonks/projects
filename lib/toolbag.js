'use strict';

var fs = require('fs'),
	path = require('path');

exports.directoryList = function(srcPath) {
	var filenames = fs.readdirSync(srcPath),
		directories = [];

	filenames.forEach(function(filename) {
		var fullPath = path.resolve(srcPath, filename);
		if (exports.isDirectory(fullPath))
			directories.push(filename);
	});

	return directories;
};

exports.fileExists = function(file) {
	try {
		fs.lstatSync(file);
		return true;
	}
	catch (error) {
		return false;
	}
};

exports.isDirectory = function(file) {
	try {
		var stats = fs.statSync(file);
		return stats && stats.isDirectory();
	}
	catch (error) {
		return false;
	}
};

exports.pathIsLoadable = function(srcPath) {
	var indexFile = path.resolve(srcPath, 'index.js');
	return exports.fileExists(indexFile);
};
