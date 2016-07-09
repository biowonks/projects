'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		genome_id: extras.positiveInteger(),
		worker_id: extras.requiredPositiveInteger(),
		module: extras.requiredText(),
		state: {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true,
				isIn: [['active', 'done', 'error']]
			}
		},
		redo: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		started_at: {
			type: Sequelize.DATE
		},
		finished_at: {
			type: Sequelize.DATE
		}
	}

	let instanceMethods = {
		updateState: function(newState) {
			let changes = {
				state: newState
			}
			if (newState === 'active')
				changes.started_at = this.sequelize.fn('clock_timestamp')
			else
				changes.finished_at = this.sequelize.fn('clock_timestamp')

			return this.update(changes, {fields: Object.keys(changes)})
		}
	}

	return {
		fields,
		params: {
			instanceMethods
		}
	}
}
