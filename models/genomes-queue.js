'use strict'

module.exports = function(Sequelize, models) {
	var fields = {
		refseq_assembly_accession: {
			primaryKey: true,
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		genbank_assembly_accession: {
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
		refseq_category: {
			type: Sequelize.TEXT
		},
		taxonomy_id: {
			type: Sequelize.INTEGER
		},
		species_taxonomy_id: {
			type: Sequelize.INTEGER
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
			type: Sequelize.TEXT
		},
		assembly_name: {
			type: Sequelize.TEXT
		},
		submitter: {
			type: Sequelize.TEXT
		},
		ftp_path: {
			type: Sequelize.TEXT
		},
		locked: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	}

	return {
		fields: fields,
		params: {
			tableName: 'genomes_queue'
		}
	}
}
