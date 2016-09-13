'use strict'

module.exports = function(Sequelize) {
	function accessionWithoutVersion(notMsg = 'accession not permitted to include version suffix') {
		return {
			type: Sequelize.TEXT,
			allowNull: true,
			validate: {
				notEmpty: true,
				not: {
					args: /\.\d+$/,
					msg: notMsg
				}
			}
		}
	}

	function dnaStrand() {
		return {
			type: Sequelize.TEXT,
			validate: {
				isIn: [['+', '-']]
			}
		}
	}

	function requiredDnaStrand() {
		let result = dnaStrand()
		result.allowNull = false
		return result
	}

	function positiveInteger() {
		return {
			type: Sequelize.INTEGER,
			allowNull: true,
			validate: {
				notEmpty: true,
				isInt: true,
				min: 1
			}
		}
	}

	function requiredAccessionWithoutVersion(notMsg) {
		let result = accessionWithoutVersion(notMsg)
		result.allowNull = false
		return result
	}

	function requiredPercentage() {
		return {
			type: Sequelize.REAL,
			allowNull: false,
			validate: {
				isFloat: true,
				min: 0,
				max: 100
			}
		}
	}

	function requiredPositiveInteger() {
		let result = positiveInteger()
		result.allowNull = false
		return result
	}

	function requiredSequence() {
		return {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true,
				is: /^[A-Z]+$/
			}
		}
	}

	function requiredText() {
		return {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		}
	}

	function seqId() {
		return {
			type: Sequelize.TEXT,
			validate: {
				notEmpty: true,
				is: /^[A-Za-z0-9_\-]{22}$/
			}
		}
	}

	function requiredSeqId() {
		let result = seqId()
		result.allowNull = false
		return result
	}

	// ----------------------------------------------------
	let validate = {
		bothNullOrBothNotEmpty: function(field1, field2) {
			return function() {
				let value1 = this.get(field1), // eslint-disable-line no-invalid-this
					value2 = this.get(field2), // eslint-disable-line no-invalid-this
					value1Empty = !value1 || /^\s*$/.test(value1),
					value2Empty = !value2 || /^\s*$/.test(value2)

				if ((value1Empty && !value2Empty) || (!value1Empty && value2Empty))
					throw new Error(`Both ${field1} and ${field2} must be null or both must be not empty`)
			}
		},

		/**
		 * Checks that the length of targetField equals the value in lengthField
		 * @param {String} lengthField
		 * @param {String} targetField
		 * @returns {Function}
		 */
		referencedLength: function(lengthField, targetField) {
			return function() {
				let expectedLength = this.get(lengthField), // eslint-disable-line no-invalid-this
					targetValue = this.get(targetField) // eslint-disable-line no-invalid-this

				if (typeof targetValue !== 'string')
					throw new Error(`${targetField} is not a string`)

				if (targetValue.length !== expectedLength)
					throw new Error(`${targetField} length does not equal the length value in ${lengthField}`)
			}
		}
	}

	return {
		accessionWithoutVersion,
		dnaStrand,
		requiredDnaStrand,
		requiredAccessionWithoutVersion,
		positiveInteger,
		seqId,
		requiredPercentage,
		requiredPositiveInteger,
		requiredSequence,
		requiredSeqId,
		requiredText,

		validate
	}
}
