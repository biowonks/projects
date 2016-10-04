'use strict'

module.exports =
class Fql {
	constructor() {
		this.input = {}
		this.sqlQuery = ''
	}

	buildQuery(rules) {
		rules.forEach(function(rule) {
			let queryInfo = this.readRule(rule)


		})
	}

	readRule(rule) {
		let rc = rule.db
		let domainIn = []
		rule.in.forEach(function(domainInfo) {
			let domain = domainInfo[0]
			let count = domainInfo[1]
			domainIn.push(domain, count) //review this.
		})
		return [rc, domainIn]
	}
}