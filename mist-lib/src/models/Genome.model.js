'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		worker_id: Object.assign(extras.positiveInteger(), {
			description: 'foreign identifier to the current worker operating on this genome',
			example: 3
		}),
		accession: Object.assign(extras.requiredAccessionWithoutVersion(), {
			description: 'NCBI RefSeq accession number',
			example: 'GCF_000302455'
		}),
		version: Object.assign(extras.requiredPositiveInteger(), {
			description: 'NCBI RefSeq version',
			example: 1
		}),
		genbank_assembly_accession: Object.assign(extras.accessionWithoutVersion(), {
			description: 'cognate GenBank accession number',
			example: 'GCA_000302455'
		}),
		genbank_assembly_version: Object.assign(extras.positiveInteger(), {
			description: 'cognate GenBank version',
			example: 1
		}),
		taxonomy_id: Object.assign(extras.positiveInteger(), {
			description: 'NCBI taxonomy id',
			example: 1204725
		}),
		name: Object.assign(extras.requiredText(), {
			example: 'Methanobacterium formicicum DSM 3637'
		}),
		refseq_category: {
			type: Sequelize.TEXT,
			description: 'RefSeq genome category',
			example: 'representative genome',
			enum: [
				'representative genome',
				'reference genome',
				'na'
			]
		},
		bioproject: {
			type: Sequelize.TEXT,
			example: 'PRJNA224116'
		},
		biosample: {
			type: Sequelize.TEXT,
			example: 'SAMN02471940'
		},
		wgs_master: {
			type: Sequelize.TEXT,
			example: 'AMPO00000000.1'
		},
		isolate: {
			type: Sequelize.TEXT
		},
		version_status: {
			type: Sequelize.TEXT,
			example: 'latest',
			enum: {
				latest: 'most recent version',
				replaced: 'version is superseded by another genome with the same wgs_master or biosample (this is not always the case)'
			}
		},
		assembly_level: {
			type: Sequelize.TEXT,
			example: 'contig',
			enum: [
				'complete',
				'scaffold',
				'contig',
				'chromosome'
			]
		},
		release_type: {
			type: Sequelize.TEXT,
			example: 'major',
			enum: [
				'major',
				'minor'
			]
		},
		release_date: {
			type: Sequelize.DATE,
			example: '2012-10-02'
		},
		assembly_name: {
			type: Sequelize.TEXT,
			description: 'not necessarily different between genome versions',
			example: 'ASM30245v1'
		},
		submitter: {
			type: Sequelize.TEXT,
			example: 'Department of Genetics, University of Seville, Spain'
		},
		ftp_path: {
			type: Sequelize.TEXT,
			validate: {
				notEmpty: true,
				isUrl: true
			},
			example: 'ftp://ftp.ncbi.nlm.nih.gov/genomes/all/GCF_000302455.1_ASM30245v1'
		},
		superkingdom: {
			type: Sequelize.TEXT,
			example: 'Archaea'
		},
		phylum: {
			type: Sequelize.TEXT,
			example: 'Euryarchaeota'
		},
		class: {
			type: Sequelize.TEXT,
			example: 'Methanobacteria'
		},
		order: {
			type: Sequelize.TEXT,
			field: 'orderr', // order is a reserved word in the database
			example: 'Methanobacteriales'
		},
		family: {
			type: Sequelize.TEXT,
			example: 'Methanobacteriaceae'
		},
		genus: {
			type: Sequelize.TEXT,
			example: 'Methanobacterium'
		},
		species: {
			type: Sequelize.TEXT,
			example: 'Methanobacterium formicicum'
		},
		strain: {
			type: Sequelize.TEXT,
			example: 'DSM 3637'
		},
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

	return {
		description: 'Genome markdown goes here',
		fields,
		params: {
			classMethods: {
				sequenceName: function() {
					return 'genomes'
				}
			},
			instanceMethods,
			validate: {
				genbankAssemblyAccessionVersion: extras.validate.bothNullOrBothNotEmpty(
					'genbank_assembly_accession',
					'genbank_assembly_version'
				)
			}
		}
	}
}
