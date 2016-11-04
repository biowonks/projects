'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		name: Object.assign(extras.requiredText(), {
			description: 'unique name that also identifies this sequence',
			example: 'components'
		}),
		last_value: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				isInt: true,
				min: 0
			},
			description: 'most recently allocated value for this sequence',
			example: '1000'
		}
	}

	return {
		fields,
		params: {
			tableName: 'id_sequences',
			timestamps: false
		}
	}
}
