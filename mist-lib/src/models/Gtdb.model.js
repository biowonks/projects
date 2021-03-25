'use strict';

module.exports = function(Sequelize, models, extras) {
  const fields = {
    release: Object.assign(extras.requiredText(), {
      primaryKey: true,
      example: '95.0',
    }),
    accession: Object.assign(extras.requiredText(), {
      primaryKey: true,
      description: 'GTDB assigned accession',
      example: 'GB_GCA_000007185.1',
    }),
    representative_accession: Object.assign(extras.requiredText(), {
      description: 'the representative GTDB accession for this entry; same as accession if representative',
      example: 'GB_GCA_000007185.1',
    }),
    is_representative: {
      type: Sequelize.BOOLEAN,
      description: 'true if this entry denotes a representative genome',
      example: true,
      allowNull: false,
    },
    ncbi_assembly_name: {
      type: Sequelize.TEXT,
      example: 'ASM718v1',
    },
    ncbi_genbank_accession: Object.assign(extras.accessionVersion(), {
      description: 'NCBI accession number with version',
      example: 'GCA_000007185.1',
    }),
    superkingdom: {
      type: Sequelize.TEXT,
      example: 'Archaea',
    },
    phylum: {
      type: Sequelize.TEXT,
      example: 'Methanobacteriota',
    },
    class: {
      type: Sequelize.TEXT,
      example: 'Methanopyri',
    },
    order: {
      type: Sequelize.TEXT,
      field: 'orderr', // order is a reserved word in the database
      example: 'Methanopyrales',
    },
    family: {
      type: Sequelize.TEXT,
      example: 'Methanopyraceae',
    },
    genus: {
      type: Sequelize.TEXT,
      example: 'Methanopyrus',
    },
    species: {
      type: Sequelize.TEXT,
      example: 'Methanopyrus kandleri',
    },
    ani_circumscription_radius: {
      type: Sequelize.FLOAT,
      example: 95,
    },
    mean_intra_species_ani: {
      type: Sequelize.FLOAT,
      example: 99.99,
    },
    min_intra_species_ani: {
      type: Sequelize.FLOAT,
      example: 99.99,
    },
    mean_intra_species_af: {
      type: Sequelize.FLOAT,
      example: 1,
    },
    min_intra_species_af: {
      type: Sequelize.FLOAT,
      example: 1,
    },
    num_clustered_genomes: Object.assign(extras.positiveInteger(), {
      example: 2,
    }),
    checkm_completeness: {
      type: Sequelize.FLOAT,
      example: 96.74,
    },
    checkm_contamination: {
      type: Sequelize.FLOAT,
      example: 1.6,
    },
    checkm_marker_count: {
      type: Sequelize.INTEGER,
      example: 188,
    },
    checkm_marker_taxa_field: {
      type: Sequelize.TEXT,
      example: 'phylum',
    },
    checkm_marker_taxa_value: {
      type: Sequelize.FLOAT,
      example: 'Euryarchaeota',
    },
    checkm_marker_uid: {
      type: Sequelize.INTEGER,
      example: 3,
    },
    checkm_marker_set_count: {
      type: Sequelize.INTEGER,
      example: 125,
    },
    checkm_strain_heterogeneity: {
      type: Sequelize.FLOAT,
      example: 0,
    },
  };

  return {
    fields,
    params: {
      tableName: 'gtdb',
      timestamps: false,
    },
  };
};
