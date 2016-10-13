'use strict'

module.exports =
class Fql {
	constructor(initialAseqs = []) {
		this.input = {}
		this.sqlQuery = ''
		this.selection = initialAseqs
	}
	/**
	* Reads rules
	* @param {Object} rules array of feature request rules
	*/
	buildQuery(rules) {
		let self = this
		rules.forEach(function(rule) {
			if (self.isValidRule_(rule))
				self.readRule_(rule)
		})
	}
	readRule_(rule) {
		let rc = rule.resource
		let feature = rule.feature
		return [rc, feature]
	}

	isValidRule_(rule) {
		let requiredFields = [
			'resource',
			'feature'
		]
		let requiredFeatureField = 'name'
		requiredFields.forEach(function(field) {
			if (!(field in rule))
				throw new Error('Must especify the ' + field)
		})
		if (Array.isArray(rule.features) === false)
			throw new Error('Value in feature must be an array')
		rule.features.forEach(function(featureRule, i) {
			if (!(requiredFeatureField in featureRule))
				throw new Error('Must give a name for the feature ' + i + ' in rule:\n' + JSON.stringify(rule, null, '  '))
			return true
		})
	}
}
