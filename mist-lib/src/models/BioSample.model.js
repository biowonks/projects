'use strict';

module.exports = function(Sequelize, models, extras) {
  const fields = {
    organism: {
      type: Sequelize.TEXT,
      example: 'Homo Sapiens',
    },
    description: {
      type: Sequelize.TEXT,
      example: 'Non-tumor DNA sample from Blood of a human female participant in the dbGaP study',
    },
    qualifiers: {
      type: Sequelize.JSONB,
      description: 'JSON object of attributes further describing this sample',
      example: '{"submitterHandle": "NCI_CIDR_SmokingTargetedGenomicRegions"}',
      defaultValue: {},
    },
  };

  return {
    fields,
    params: {
      tableName: 'biosamples',
      timestamps: false,
    },
  };
};
