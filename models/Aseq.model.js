'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		length: extras.requiredPositiveInteger(),
		sequence: extras.requiredSequence(),
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
		sequenceLength: extras.validate.referencedLength('length', 'sequence')
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
