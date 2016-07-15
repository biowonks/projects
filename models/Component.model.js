'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		genome_id: extras.requiredPositiveInteger(),
		accession: extras.requiredAccessionWithoutVersion(),
		version: extras.requiredPositiveInteger(),
		genbank_accession: extras.accessionWithoutVersion(),
		genbank_version: extras.positiveInteger(),
		name: {
			type: Sequelize.TEXT
		},
		role: {
			type: Sequelize.TEXT
		},
		assigned_molecule: {
			type: Sequelize.TEXT
		},
		type: {
			type: Sequelize.TEXT
		},
		genbank_refseq_relationship: {
			type: Sequelize.TEXT
		},
		definition: {
			type: Sequelize.TEXT
		},
		molecule_type: {
			type: Sequelize.TEXT
		},
		is_circular: {
			type: Sequelize.BOOLEAN
		},
		annotation_date: {
			type: Sequelize.DATE
		},
		comment: {
			type: Sequelize.TEXT
		},
		dna: extras.requiredSequence(),
		length: extras.requiredPositiveInteger(),
		stats: {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: {}
		}
	}

	let instanceMethods = {
		compoundAccession: function() {
			return this.accession + '.' + this.version
		}
	}

	let validate = {
		genbankAccessionVersion: extras.validate.bothNullOrBothNotEmpty('genbank_accession',
			'genbank_version'),
		dnaLength: extras.validate.referencedLength('length', 'dna')
	}

	return {
		fields,
		params: {
			instanceMethods,
			validate
		}
	}
}
