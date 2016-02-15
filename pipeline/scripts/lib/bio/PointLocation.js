'use strict'

let Location = require('./Location')

module.exports =
class PointLocation extends Location {
	constructor(locationPoint) {
		super(locationPoint, locationPoint)
	}
}
