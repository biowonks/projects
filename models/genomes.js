'use strict'

module.exports = function(Sequelize, models) {
	var fields = {
		refseq_assembly_accession: {
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
		},
		superkingdom: {
			type: Sequelize.TEXT
		},
		phylum: {
			type: Sequelize.TEXT
		},
		class: {
			type: Sequelize.TEXT
		},
		orderr: {
			type: Sequelize.TEXT
		},
		family: {
			type: Sequelize.TEXT
		},
		genus: {
			type: Sequelize.TEXT
		},
		species: {
			type: Sequelize.TEXT
		},
		strain: {
			type: Sequelize.TEXT
		},
		taxonomic_group: {
			type: Sequelize.TEXT
		},
		stats: {
			type: Sequelize.JSONB
		},
		status: {
			type: Sequelize.JSONB
		}
	}

	return {
		fields: fields,
		params: {
			classMethods: {
				sequenceName: function() {
					return 'genomes'
				}
			}
		}
	}
}
