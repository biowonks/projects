'use strict'

// Core
const assert = require('assert')

// Local
const seqUtil = require('core-lib/bio/seq-util')

// Constants
const kToolIdFieldNames = ['pfam30', 'agfam2', 'segs', 'coils', 'tmhmm2', 'ecf1']

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
		},
		tmhmm2: {
			type: Sequelize.JSONB,
			description: 'object containing two items: topology - array of arrays classifying all regions of the sequence, and tms - array of ranges denoting regions predicted to have transmembrane regions'
		},
		ecf1: Object.assign(hmmer2(Sequelize, 'ecf1'), {
			description: 'array of extra cytoplasmic factor predictions',
		}),
	}

	// Ensure that the fields and tool id fields are in sync
	kToolIdFieldNames.forEach((toolId) => {
		assert(Reflect.has(fields, toolId), `tool id, ${toolId}, is missing from fields`)
	})

	// Model validations
	const validate = {
		sequenceLength: extras.validate.referencedLength('length', 'sequence')
	}

	const classMethods = {
		/**
		 * @param {Seq} seq
		 * @returns {Object}
		 */
		dataFromSeq: function(seq) {
			const normalizedSequence = seq.normalizedSequence()
			return {
				id: seq.seqId(),
				length: normalizedSequence.length,
				sequence: normalizedSequence
			}
		},
		/**
		 * @param {aseqId} aseqId
		 * @returns {Boolean}
		 */
		isValidId: function(aseqId) {
			const idPattern = /^[A-Za-z0-9_\-]{22}$/
			return idPattern.test(aseqId)
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

	const instanceMethods = {
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
			const domains = this.getDataValue(fieldName)
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

			const arrayifiedDomains = domains.map((domain) => [
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

function hmmer2(Sequelize, fieldName) {
	return {
		type: Sequelize.JSONB,
		get: function() {
			const domains = this.getDataValue(fieldName)
			if (!domains)
				return domains

			return domains.map((x) => {
				return {
					name: x[0],
					score: x[1],
					evalue: x[2],
					hmm_from: x[3],
					hmm_to: x[4],
					hmm_cov: x[5],
					ali_from: x[6],
					ali_to: x[7],
					ali_cov: x[8],
				}
			})
		},
		set: function(domains) {
			if (!domains) {
				this.setDataValue(fieldName, null)
				return
			}

			const arrayifiedDomains = domains.map((domain) => [
				domain.name,
				domain.score,
				domain.evalue,
				domain.hmm_from,
				domain.hmm_to,
				domain.hmm_cov,
				domain.ali_from,
				domain.ali_to,
				domain.ali_cov,
			])
			this.setDataValue(fieldName, arrayifiedDomains)
		}
	}
}
