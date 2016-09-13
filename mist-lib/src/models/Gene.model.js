'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		component_id: extras.requiredPositiveInteger(),
		dseq_id: extras.requiredSeqId(),
		aseq_id: extras.seqId(),
		accession: extras.accessionWithoutVersion(),
		version: extras.positiveInteger(),
		locus: {
			type: Sequelize.TEXT
		},
		old_locus: {
			type: Sequelize.TEXT
		},
		location: extras.requiredText(),
		strand: extras.requiredDnaStrand(),
		start: extras.requiredPositiveInteger(),
		stop: extras.requiredPositiveInteger(),
		length: extras.requiredPositiveInteger(),
		cognate_key: {
			type: Sequelize.TEXT
		},
		cognate_location: {
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
		accessionVersion: extras.validate.bothNullOrBothNotEmpty('accession', 'version')
	}

	return {
		fields,
		params: {
			validate,
			timestamps: false
		}
	}
}
