'use strict'

const path = require('path')
const pfql = require('pfql')

const DefaultTableFilePath = path.resolve(__dirname, '..', 'rules', 'mist3-sig-trans-2017.csv')

module.exports =
class SignalTransductionService {
	constructor(pfqlRules = []) {
		this.pfqlRules = pfqlRules
	}

	setPfqlStream() {
		this.pfqlStream = new pfql.PFQLStream(this.pfqlRules)
		this.pfqlStream.initRules()
	}
}
