'use strict';

const {mapHmmer3RowArraysToHashes} = require('seqdepot-lib/hmmer-utils');

module.exports = function(Sequelize, models, extras) {
  const fields = {
    gene_id: Object.assign(extras.requiredPositiveInteger(), {
      description: 'foreign identifier to the source gene',
      example: 3423521,
    }),
    component_id: Object.assign(extras.requiredPositiveInteger(), {
      description: 'foreign identifier to the source component for this gene',
      example: 982,
    }),
    signal_domains_version: Object.assign(extras.requiredPositiveInteger(), {
      description: 'signal transduction prediction algorithm version used to identify this gene',
      example: 1,
    }),
    ranks: Object.assign(extras.arrayWithNoEmptyValues(), {
      description: 'array of assigned signal transduction ranks (e.g. [2cp, rr])',
      example: ['2cp', 'rr'],
    }),
    counts: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
      validate: {
        notEmpty: true,
      },
      description: 'key-value structure denoting the number of signal domains in this protein',
      example: {
        RR: 1,
        HTH_1: 1,
      },
    },
    inputs: Object.assign(extras.arrayWithNoEmptyValues(), {
      description: 'array of input signal transduction domains (signal domain names)',
      example: [],
    }),
    outputs: Object.assign(extras.arrayWithNoEmptyValues(), {
      description: 'array of output signal transduction domains (signal domain names)',
      example: ['HTH_1'],
    }),
    data: {
      type: Sequelize.JSONB,
      allowNull: false,
      description: 'supporting data such as top chemotaxis classification hits',
      get: function() {
        const data = this.getDataValue('data');
        if (!data || !data.cheHits)
          return data;

        data.cheHits = mapHmmer3RowArraysToHashes(data.cheHits);
        return data;
      },
    },
  };

  return {
    classMethods: {
      sequenceName: function() {
        return 'signal_genes';
      },
    },
    fields,
    params: {
      tableName: 'signal_genes',
      timestamps: false,
    },
  };
};
