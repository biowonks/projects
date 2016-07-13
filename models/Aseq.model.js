'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		length: extras.requiredPositiveInteger(),
		sequence: extras.requiredSequence(),
		pfam30: {
			type: Sequelize.JSONB,
			defaultValue: {}
		},
		segs: {
			type: Sequelize.JSONB,
			defaultValue: {}
		},
		coils: {
			type: Sequelize.JSONB,
			defaultValue: {}
		}
	}

	// Model validations
	let validate = {
		sequenceLength: extras.validate.referencedLength('length', 'sequence')
	}

	let classMethods = {
		/**
		 * @param {Seq} seq
		 * @returns {Object}
		 */
		dataFromSeq: function(seq) {
			let normalizedSequence = seq.normalizedSequence()
			return {
				id: seq.seqId(),
				length: normalizedSequence.length,
				sequence: normalizedSequence
			}
		}
	}

	return {
		fields,
		params: {
			classMethods,
			validate,
			schema: 'seqdepot'
		}
	}
}
