'use strict'

// Core
const assert = require('assert')

// Local
const seqUtil = require('core-lib/bio/seq-util')

// Constants
const kToolIdFieldNames = ['pfam30', 'agfam2', 'segs', 'coils']

module.exports = function(Sequelize, models, extras) {
	let fields = {
		length: Object.assign(extras.requiredPositiveInteger(), {
			description: 'length of amino acid sequence',
			example: '393'
		}),
		sequence: Object.assign(extras.requiredSequence(), {
			description: 'normalized, amino acid sequence'
		}),
		pfam30: Object.assign(hmmer3(Sequelize, 'pfam30'), {
			description: 'array of pfam30 predictions'
		}),
		agfam2: Object.assign(hmmer3(Sequelize, 'agfam2'), {
			description: 'array of agfam2 predictions'
		}),
		segs: {
			type: Sequelize.JSONB,
			description: 'array of ranges denoting low-complexity regions'
		},
		coils: {
			type: Sequelize.JSONB,
			description: 'array of ranges denoting coiled-coil regions'
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
			timestamps: false
		}
	}
}
module.exports.kToolIdFieldNames = kToolIdFieldNames

function hmmer3(Sequelize, fieldName) {
	return {
		type: Sequelize.JSONB,
		get: function() {
			let domains = this.getDataValue(fieldName)
			if (!domains)
				return domains

			return domains.map((x) => {
				return {
					name: x[0],
					score: x[1],
					bias: x[2],
					c_evalue: x[3],
					i_evalue: x[4],
					hmm_from: x[5],
					hmm_to: x[6],
					hmm_cov: x[7],
					ali_from: x[8],
					ali_to: x[9],
					ali_cov: x[10],
					env_from: x[11],
					env_to: x[12],
					env_cov: x[13],
					acc: x[14]
				}
			})
		},
		set: function(domains) {
			if (!domains) {
				this.setDataValue(fieldName, null)
				return
			}

			let arrayifiedDomains = domains.map((domain) => [
				domain.name,
				domain.score,
				domain.bias,
				domain.c_evalue,
				domain.i_evalue,
				domain.hmm_from,
				domain.hmm_to,
				domain.hmm_cov,
				domain.ali_from,
				domain.ali_to,
				domain.ali_cov,
				domain.env_from,
				domain.env_to,
				domain.env_cov,
				domain.acc
			])
			this.setDataValue(fieldName, arrayifiedDomains)
		}
	}
}
