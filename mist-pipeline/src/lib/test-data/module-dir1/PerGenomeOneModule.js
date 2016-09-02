'use strict'

// Local
const PerGenomePipelineModule = require('../../PerGenomePipelineModule')

module.exports =
class PerGenomeOneModule extends PerGenomePipelineModule {
	static dependencies() {
		return ['OnceTwoModule']
	}

	static subModuleMap() {
		return new Map([
			['subModule1', 'subModule 1 description'],
			['subModule2', 'subModule 2 description']
		])
	}
}
