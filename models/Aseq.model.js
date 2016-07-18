'use strict'

// Core
const assert = require('assert')

// Local
const seqUtil = require('../pipeline/lib/bio/seq-util')

// Constants
const kToolIdFieldNames = ['pfam30', 'segs', 'coils']

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

	// Ensure that the fields and tool id fields are in sync
	kToolIdFieldNames.forEach((toolId) => {
		assert(Reflect.has(fields, toolId), `tool id, ${toolId}, is missing from fields`)
	})

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
		},

		/**
		 * @param {Seq} seq
		 * @returns {Aseq}
		 */
		fromSeq: function(seq) {
			return this.build(this.dataFromSeq(seq))
		},

		/**
		 * @returns {Array.<String>} - toolId field names that contain the results of running that specific tool
		 */
		toolIdFieldNames: function() {
			return kToolIdFieldNames
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
module.exports.kToolIdFieldNames = kToolIdFieldNames
