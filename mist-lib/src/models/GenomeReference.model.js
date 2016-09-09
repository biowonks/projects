'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		genome_id: extras.requiredPositiveInteger(),
		pubmed_id: extras.positiveInteger(),
		medline_id: extras.positiveInteger(),
		title: extras.requiredText(),
		authors: {
			type: Sequelize.TEXT
		},
		consortium: {
			type: Sequelize.TEXT
		},
		journal: {
			type: Sequelize.TEXT
		},
		remark: {
			type: Sequelize.TEXT
		},
		notes: {
			type: Sequelize.TEXT
		}
	}

	return {
		fields
	}
}
