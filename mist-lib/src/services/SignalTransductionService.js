'use strict'

const path = require('path')
const pfql = require('pfql')

module.exports =
class SignalTransductionService {
	constructor(pfqlRules = []) {
		this.pfqlRules = pfqlRules
	}
}
