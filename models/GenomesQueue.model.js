'use strict'

module.exports = function(Sequelize, models) {
	let fields = {
		worker_id: {
			type: Sequelize.INTEGER,
			validate: {
				notEmpty: true,
				isInt: true,
				min: 1
			}
		},
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
		name: {
			type: Sequelize.TEXT
		}
	}

	return {
		fields,
		params: {
			tableName: 'genomes_queue',
			instanceMethods: {
				short: function() {
					return {
						'genome.name': this.name,
						refseq_assembly_accession: this.refseq_assembly_accession
					}
				}
			}
		}
	}
}
