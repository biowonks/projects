'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		component_id: extras.requiredPositiveInteger(),
		dseq_id: extras.requiredPositiveInteger(),
		aseq_id: extras.positiveInteger(),
		accession: extras.accessionWithoutVersion(),
		version: extras.positiveInteger(),
		locus: {
			type: Sequelize.TEXT
		},
		old_locus: {
			type: Sequelize.TEXT
		},
		location: extras.requiredText(),
		strand: extras.dnaStrand(),
		start: extras.requiredPositiveInteger(),
		stop: extras.requiredPositiveInteger(),
		length: extras.requiredPositiveInteger(),
		key: {
			type: Sequelize.TEXT
		},
		names: {
			// eslint-disable-next-line new-cap
			type: Sequelize.ARRAY(Sequelize.TEXT),
			validate: {
				noEmptyValues: function(value) {
					if (!value)
						return value

					if (!Array.isArray(value))
						throw new Error('Must be an array')

					for (let val of value) {
						if (!val || /^\s*$/.test(val))
							throw new Error('Each value must not be empty')
					}

					return value
				}
			}
		},
		pseudo: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			validate: {
				notEmpty: true
			}
		},
		product: {
			type: Sequelize.TEXT,
			validate: {
				notEmpty: true
			}
		},
		codon_start: {
			type: Sequelize.INTEGER,
			validate: {
				isInt: true,
				isIn: [[1, 2, 3]] // eslint-disable-line no-magic-numbers
			}
		},
		translation_table: {
			type: Sequelize.INTEGER,
			validate: {
				isInt: true,
				min: 1
			}
		},
		notes: {
			type: Sequelize.TEXT
		},
		qualifiers: {
			type: Sequelize.JSONB,
			defaultValue: {}
		}
	}

	let validate = {
		accessionVersion: extras.validate.bothNullOrBothNotEmpty('accession', 'version'),
		correctLength: function() {
			if (this.stop - this.start + 1 !== this.length)
				throw new Error('Length does not equal stop - start + 1')
		}
	}

	return {
		fields,
		params: {
			validate
		}
	}
}
