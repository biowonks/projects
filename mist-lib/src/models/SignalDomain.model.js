'use strict';

module.exports = function(Sequelize, models, extras) {
  const fields = {
    name: Object.assign(extras.requiredText(), {
      description: 'unique human friendly identifier that is source independent (e.g. may relate to domain models across pfam and agfam)',
      example: 'PAS',
    }),
    version: Object.assign(extras.requiredPositiveInteger(), {
      description: 'prediction algorithm version',
      example: 1,
    }),
    kind: {
      type: Sequelize.TEXT,
      description: 'kind of signal domain: input, transmitter, receiver, output, chemoataxis, ecf, etc.',
      example: 'transmitter',
    },
    function: {
      type: Sequelize.TEXT,
      description: 'general purpose function',
      example: 'small molecule binding',
    },
  };

  return {
    classMethods: {
      sequenceName: function() {
        return 'signal_domains';
      },

      // Returns only those fields necessary for the StpService to analyze
      // aseqs for signal transduction.
      getMinimalStpSpec: function(version) {
        if (!version)
          return Promise.resolve([]);

        const {SignalDomain, SignalDomainMember} = models;
        const signalDomainTable = SignalDomain.getTableName();
        const signalDomainMembersTable = SignalDomainMember.getTableName();
        const sql = `
          SELECT
            ${signalDomainTable}.name as id,
            kind,
            function,
            ${signalDomainMembersTable}.name,
            specific,
            source
          FROM ${signalDomainTable} JOIN ${signalDomainMembersTable} ON (${signalDomainTable}.id = ${signalDomainMembersTable}.signal_domain_id)
          WHERE version = ?
        `;
        const {sequelize} = SignalDomain;
        return sequelize.query(
          sql,
          {
            replacements: [version],
            type: sequelize.QueryTypes.SELECT,
          },
        );
      },

      getSignalDomainNames: function(version, kind, func, transaction) {
        const where = {
          version,
          kind,
        };
        if (func)
          where.function = func;


        return models.SignalDomain.findAll({
          where,
          attributes: ['name'],
          raw: true,
          transaction,
        })
          .then((rows) => rows.map((row) => row.name));
      },
    },
    fields,
    params: {
      tableName: 'signal_domains',
    },
  };
};
