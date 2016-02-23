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
		this.operator_ = operator
		this.exact_ = false
	}

	hasDefiniteStart() {
		return this.operator_ === '<'
	}

	hasDefiniteStop() {
		return this.operator_ === '>'
	}
}
