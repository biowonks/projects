'use strict'

// Core node libraries
let assert = require('assert')

// Local includes
let LocationPoint = require('./LocationPoint')

// <10 or >10
module.exports =
class FuzzyLocationPoint extends LocationPoint {
	constructor(operator, position) {
		assert(operator === '>' || operator === '<', 'operator must be either > or <')
		super(position)
		this.exact_ = false
	}
}
