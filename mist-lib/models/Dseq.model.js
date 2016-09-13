'use strict'

// Local
const seqUtil = require('../bio/seq-util')

// Constants
const kFloatPrecision = 6

module.exports = function(Sequelize, models, extras) {
	let fields = {
		length: extras.requiredPositiveInteger(),
		gc_percent: extras.requiredPercentage(),
		sequence: extras.requiredSequence()
	}

	// Model validations
	let validate = {
		sequenceLength: extras.validate.referencedLength('length', 'sequence'),
		accurateGC: () => {
			let gcPercent = seqUtil.gcPercent(this.sequence)
			if (gcPercent.toFixed(kFloatPrecision) !== this.gcPercent.toFixed(kFloatPrecision))
				throw new Error('GC percent does not reflect GC composition in sequence')
		}
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

	let instanceMethods = {
		toFasta: function() {
			return seqUtil.fasta(this.id, this.sequence)
		},
		toJSON: function() {
			let values = this.get()
			values.gc_percent = Number(values.gc_percent.toFixed(kFloatPrecision))
			return values
		}
	}

	return {
		fields,
		params: {
			classMethods,
			instanceMethods,
			validate,
			schema: 'seqdepot',
			timestamps: false
		}
	}
}
