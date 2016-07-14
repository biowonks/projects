'use strict'

// Local
const seqUtil = require('../pipeline/lib/bio/seq-util')

module.exports = function(Sequelize, models, extras) {
	let fields = {
		length: extras.requiredPositiveInteger(),
		sequence: extras.requiredSequence(),
		pfam30: {
			type: Sequelize.JSONB
		},
		segs: {
			type: Sequelize.JSONB
		},
		coils: {
			type: Sequelize.JSONB
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

	let instanceMethods = {
		toFasta: function() {
			return seqUtil.fasta(this.id, this.sequence)
		}
	}

	return {
		fields,
		params: {
			classMethods,
			instanceMethods,
			validate,
			schema: 'seqdepot'
		}
	}
}
