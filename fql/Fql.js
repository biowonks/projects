'use strict'

module.exports =
class Fql {
	constructor() {
		this.input = {}
		this.sqlQuery = ''
	}

	buildQuery(rules) {
		rules.forEach(function(rule) {
			let queryInfo = readRule(rule)


		})
	}

	readRule(rule) {
		let rc = rule.db
		let domainIn = []
		rule.in.forEach(function(domain) {
			domainIn.push(domain)
		})
		return [rc, domainIn]
	}
}