'use strict'

// Core
const path = require('path')

// Vendor
const express = require('express')

// Constants
const kDocsPath = path.resolve(__dirname, '..', '..', 'docs', 'build'),
	staticHandler = express.static(kDocsPath, {
		fallthrough: false
	})

module.exports = function() {
	return staticHandler
}
