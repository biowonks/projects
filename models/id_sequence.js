'use strict'

module.exports = function(Sequelize, models) {
	let fields = {
		name: {
			primaryKey: true,
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		last_value: {
			type: Sequelize.INTEGER,
			validate: {
				isInt: true,
				min: 0
			}
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
