'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		worker_id: extras.positiveInteger(),
		accession: extras.requiredAccessionWithoutVersion(),
		version: extras.requiredPositiveInteger(),
		genbank_assembly_accession: extras.accessionWithoutVersion(),
		genbank_assembly_version: extras.positiveInteger(),
		taxonomy_id: extras.positiveInteger(),
		species_taxonomy_id: extras.positiveInteger(),
		name: extras.requiredText(),
		refseq_category: {
			type: Sequelize.TEXT
		},
		bioproject: {
			type: Sequelize.TEXT
		},
		biosample: {
			type: Sequelize.TEXT
		},
		wgs_master: {
			type: Sequelize.TEXT
		},
		isolate: {
			type: Sequelize.TEXT
		},
		version_status: {
			type: Sequelize.TEXT
		},
		assembly_level: {
			type: Sequelize.TEXT
		},
		release_type: {
			type: Sequelize.TEXT
		},
		release_date: {
			type: Sequelize.DATE
		},
		assembly_name: {
			type: Sequelize.TEXT
		},
		submitter: {
			type: Sequelize.TEXT
		},
		ftp_path: {
			type: Sequelize.TEXT,
			validate: {
				notEmpty: true,
				isUrl: true
			}
		}
	}

	let instanceMethods = {
		compoundAccession: function() {
			return this.accession + '.' + this.version
		}
	}

	return {
		fields,
		params: {
			instanceMethods,
			tableName: 'genomes_queue',
			validate: {
				genbankAssemblyAccessionVersion: extras.validate.bothNullOrBothNotEmpty(
					'genbank_assembly_accession',
					'genbank_assembly_version'
				)
			}
		}
	}
}
