'use strict'

// Local
const seqUtil = require('../pipeline/lib/bio/seq-util')

// Constants
const kFloatPrecision = 6

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
		gc_percent: {
			type: Sequelize.REAL,
			allowNull: false,
			validate: {
				isFloat: true,
				min: 0,
				max: 100
			}
		},
		sequence: {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true,
				is: /^[A-Z]+$/
			}
		}
	}

	// Model validations
	let validate = {
		sequenceLength: () => {
			if (this.sequence.length !== this.length)
				throw new Error('Sequence length does not equal the length property')
		},
		accurateGC: () => {
			let gcPercent = seqUtil.gcPercent(this.sequence)
			if (gcPercent.toFixed(kFloatPrecision) !== this.gcPercent.toFixed(kFloatPrecision))
				throw new Error('GC percent does not reflect GC composition in sequence')
		}
	}

	// Class methods
	let classMethods = {
		fromSeq: (seq) => {
			let clonedSeq = seq.clone()
			clonedSeq.normalize()

			return models.Gseq.build({
				id: clonedSeq.seqId(),
				length: clonedSeq.length(),
				gc_percent: clonedSeq.gcPercent(),
				sequence: clonedSeq.sequence()
			})
		}
	}

	let instanceMethods = {
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
			validate
		}
	}
}
