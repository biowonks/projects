'use strict'

// Local
const seqUtil = require('core-lib/bio/seq-util')

// Constants
const kFloatPrecision = 6

module.exports = function(Sequelize, models, extras) {
	const fields = {
		length: extras.requiredPositiveInteger(),
		gc_percent: extras.requiredPercentage(),
		sequence: extras.requiredSequence()
	}

	// Model validations
	const validate = {
		sequenceLength: extras.validate.referencedLength('length', 'sequence'),
		accurateGC: () => {
			const gcPercent = seqUtil.gcPercent(this.sequence)
			if (gcPercent.toFixed(kFloatPrecision) !== this.gcPercent.toFixed(kFloatPrecision))
				throw new Error('GC percent does not reflect GC composition in sequence')
		}
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
				gc_percent: seqUtil.gcPercent(normalizedSequence),
				sequence: normalizedSequence
			}
		},

		/**
		 * @param {Seq} seq
		 * @returns {Aseq}
		 */
		fromSeq: function(seq) {
			return this.build(this.dataFromSeq(seq))
		}
	}

	const instanceMethods = {
		toFasta: function() {
			return seqUtil.fasta(this.id, this.sequence)
		},
		toJSON: function() {
			const values = this.get()
			values.gc_percent = Number(values.gc_percent.toFixed(kFloatPrecision))
			return values
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
