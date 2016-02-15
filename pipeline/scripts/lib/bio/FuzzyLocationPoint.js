'use strict'

let LocationPoint = require('./LocationPoint')

// <10 or >10
module.exports =
class FuzzyLocationPoint extends LocationPoint {
	constructor(operator, position) {
		assert(operator === '>' || operator === '<')
		super(position)
		this.exact_ = false
	}
}
