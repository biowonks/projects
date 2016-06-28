'use strict'

module.exports = function(Sequelize, models) {
	let fields = {
		length: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				isInt: true,
				min: 1
			}
		},
		sequence: {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true,
				is: /^[A-Z]+$/
			}
		},
		tool_status: {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: {}
		},
		features: {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: {}
		}
	}

	// Model validations
	let validate = {
		sequenceLength: function() {
			if (this.sequence.length !== this.length)
				throw new Error('Sequence length does not equal the length property')
		}
	}

	let classMethods = {
		fromSeq: (seq) => {
			let clonedSeq = seq.clone()
			clonedSeq.normalize()

			return models.Aseq.build({
				id: clonedSeq.seqId(),
				length: clonedSeq.length(),
				sequence: clonedSeq.sequence()
			})
		}
	}

	let instanceMethods = {
		hasData: function(toolAlias) {
			return !!this.features[toolAlias]
		}
	}

	return {
		fields,
		params: {
			instanceMethods,
			classMethods,
			validate
		}
	}
}
