'use strict'

// Core
const assert = require('assert')

// Local
const seqUtil = require('core-lib/bio/seq-util')
const {
	mapHmmer3RowArraysToHashes,
	mapHmmer3RowHashesToArrays,
} = require('../hmmer-utils')

// Constants
const kToolIdFieldNames = ['pfam31', 'agfam2', 'segs', 'coils', 'tmhmm2', 'ecf1']

module.exports = function(Sequelize, models, extras) {
	let fields = {
		length: Object.assign(extras.requiredPositiveInteger(), {
			description: 'length of amino acid sequence',
			example: '393'
		}),
		sequence: Object.assign(extras.requiredSequence(), {
			description: 'normalized, amino acid sequence'
		}),
		pfam31: Object.assign(hmmer3(Sequelize, 'pfam31'), {
			description: 'array of pfam31 predictions'
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
		stp: {
			/**
			 * {
			 *  ranks: ['2cp', 'rr'],
			 *  inputs: [
			 *    PAS,
			 *    ...
			 *  ],
			 *  inputFunctions: [
			 * 	  'small molecule binding',
			 *  ],
			 *  outputs: [
			 *    HTH_1,
			 *    ...
			 *  ],
			 *  outputFunctions: [
			 *    'DNA binding'
			 *  ],
			 *  counts: {
			 *    PAS: 2,
			 *    HTH_1: 1,
			 *    ...
			 *  },
			 *  version: 1,
			 * }
			 */
			type: Sequelize.JSONB,
			description: 'signal transduction prediction data; the version field indicates the spec file version used for these predictions',
			get: function() {
				const stp = this.getDataValue('stp')
				if (!stp || !stp.cheHits)
					return stp

				stp.cheHits = mapHmmer3RowArraysToHashes(stp.cheHits)
				return stp
			}
		},
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
		classMethods,
		fields,
		instanceMethods,
		params: {
			timestamps: false,
			validate,
		},
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

			return mapHmmer3RowArraysToHashes(domains)
		},
		set: function(domains) {
			if (!domains) {
				this.setDataValue(fieldName, null)
				return
			}

			const arrayifiedDomains = mapHmmer3RowHashesToArrays(domains)
			this.setDataValue(fieldName, arrayifiedDomains)
		},
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
