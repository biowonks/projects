'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		component_id: extras.requiredPositiveInteger(),
		gene_id: extras.positiveInteger(),
		key: extras.requiredText(),
		location: extras.requiredText(),
		strand: extras.dnaStrand(),
		start: extras.requiredPositiveInteger(),
		stop: extras.requiredPositiveInteger(),
		length: extras.requiredPositiveInteger(),
		qualifiers: {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: {}
		}
	}

	return {
		fields,
		params: {
			timestamps: false
		}
	}
}
