'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		component_id: extras.requiredPositiveInteger(),
		strand: extras.requiredDnaStrand(),
		size: extras.requiredPositiveInteger()
	}

	return {
		fields,
		params: {
			timestamps: false
		}
	}
}
