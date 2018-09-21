'use strict'

module.exports = function(Sequelize, models, extras) {
  const fields = {
    signal_domain_id: Object.assign(extras.requiredPositiveInteger(), {
      description: 'foreign identifier to this members associated signal domain',
      example: 1,
    }),
    accession: {
      type: Sequelize.TEXT,
      description: 'source specific accession number (optional)',
      example: 'PF00989',
    },
    name: Object.assign(extras.requiredText(), {
      description: 'name of the source domain model',
      example: 'PAS',
    }),
    superfamily: {
      type: Sequelize.TEXT,
      description: 'superfamily or clan this domain model belongs to',
      example: 'PAS',
    },
    description: {
      type: Sequelize.TEXT,
      description: 'domain model details',
      example: 'PAS small molecule binding domain',
    },
    specific: Object.assign(extras.requiredBoolean(), {
      description: 'boolean value indicating if this domain is specific to signal transduction; if true, may be used to putatively identify signal transduction proteins',
      example: true,
    }),
    source: Object.assign(extras.requiredText(), {
      description: 'database or other source where this model originated from (e.g. pfam, agfam, etc.)',
      example: 'pfam',
    }),
    pubmed_ids: Object.assign(extras.arrayWithNoEmptyValues(), {
      description: 'array of relevant PubMed identifiers',
      example: [9301332, 9382818],
    }),
    pdb_ids: Object.assign(extras.arrayWithNoEmptyValues(), {
      description: 'array of relevant PDB identifiers',
      example: [],
    }),
  }

  return {
    classMethods: {
      sequenceName: function() {
        return 'signal_domains_members'
      },
    },
    fields,
    params: {
      tableName: 'signal_domains_members',
      timestamps: false,
    },
  }
}
