'use strict'

module.exports = function(Sequelize, models) {
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
		public_ip: {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true,
				isIP: true
			}
		},
		message: {
			type: Sequelize.TEXT
		},
		normal_exit: {
			type: Sequelize.BOOLEAN
		},
		error_message: {
			type: Sequelize.TEXT
		},
		last_heartbeat_at: {
			type: Sequelize.DATE
		}
	}

	return {
		fields
	}
}
