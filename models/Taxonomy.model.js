'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		parent_taxonomy_id: extras.requiredPositiveInteger(),
		name: extras.requiredText(),
		rank: {
			type: Sequelize.TEXT,
			validate: {
				notEmpty: true
			}
		}
	}

	return {
		fields,
		params: {
			timestamps: false,
			tableName: 'taxonomy'
		}
	}
}
