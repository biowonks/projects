'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		hostname: {
			type: Sequelize.TEXT
		},
		pid: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true,
				isInt: true
			}
		},
		public_ip: extras.requiredText(),
		message: {
			type: Sequelize.TEXT
		},
		normal_exit: {
			type: Sequelize.BOOLEAN
		},
		error_message: {
			type: Sequelize.TEXT
		},
		job: {
			type: Sequelize.JSONB
		},
		last_heartbeat_at: {
			type: Sequelize.DATE
		}
	}

	return {
		fields
	}
}
