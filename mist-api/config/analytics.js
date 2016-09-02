'use strict'

// Core
let path = require('path')

module.exports = function(kRootPath) {
	return {
		gaTrackingId: null,
		beaconImageFile: path.resolve(kRootPath, 'assets', 'img', 'beacon.gif')
	}
}
