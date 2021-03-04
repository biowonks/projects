'use strict';

// Vendor
const _ = require('lodash');
const {Op} = require('sequelize');

// Local
const {scrub, splitAndScrubString} = require('core-lib/util');

exports.signalGeneFinderMiddlewares = function(app, middlewares, inputGetter) {
  const models = app.get('models');
  const helper = app.get('lib').RouteHelper.for(models.SignalGene);
  const signalTransductionVersion = app.get('config').signalTransduction
    .version;
  const sequelize = app.get('sequelize');

  return [
    middlewares.parseCriteriaForMany(
      models.SignalGene,
      {
        accessibleModels: [models.Component, models.Gene, models.Aseq],
        maxPage: null,
        permittedOrderFields: '*',
        permittedWhereFields: [
          'id',
          'gene_id',
          'component_id',
          'ranks',
        ],
      },
      inputGetter,
    ),
    (req, res, next) => {
      res.locals.criteria.include.push({
        model: models.Component,
        attributes: ['name', 'version', 'definition'],
        where: {
          genome_id: res.locals.genome.id,
        },
        required: true,
      });

      // Optimization to help PostgreSQL avoid using the wrong index. Namely,
      // when there is an order by (added by default if not specified) and a
      // limit applied, the query planner will poorly choose to scan the
      // signal_genes_pkey index instead of the component_id indices. We nudge
      // the planner away from this by also ordering by component_id if this is
      // the case.
      const firstOrderBy = res.locals.criteria.order[0];
      const orderingByPrimaryKeyOnly = res.locals.criteria.order.length === 1
        && firstOrderBy.length
        && firstOrderBy[0] === models.SignalGene.primaryKeyAttributes[0];
      if (orderingByPrimaryKeyOnly) {
        res.locals.criteria.order.push(['component_id']);
      }

      const ranks = splitAndScrubString(
        inputGetter(req)['where.ranks'],
        ',',
      );
      if (ranks.length) {
        // Perform a contains query so that we can accomodate partial array matches.
        // For example, finding all tcp proteins regardless of their second rank would
        // not work with an exact match.
        res.locals.criteria.where.ranks = {
          [Op.contains]: ranks,
        };
      }

      // Provide for searching by function / kind
      const kind = scrub(inputGetter(req).kind);
      if (!kind) {
        next();
        return;
      }

      const func = scrub(inputGetter(req).function);
      sequelize
        .transaction()
        .then((transaction) => {
          res.locals.criteria.transaction = transaction;
          return models.SignalDomain.getSignalDomainNames(
            signalTransductionVersion,
            kind,
            func,
            transaction,
          );
        })
        .then((namesByKindAndFunction) => {
          if (namesByKindAndFunction.length) {
            // TODO: refactor this into a helper method that may be easily reused
            const escapedArrayList = namesByKindAndFunction
              .map((name) => sequelize.escape(name))
              .join(',');
            const queryInterface = sequelize.getQueryInterface();
            const tableName = queryInterface.quoteTable(
              models.SignalGene.name,
            );
            const field = queryInterface.quoteIdentifier('counts');
            _.set(
              res.locals.criteria,
              ['where', Op.and],
              sequelize.literal(
                `${tableName}.${field} ?| array[${escapedArrayList}]`,
              ),
            );
            next();
            return;
          }

          // User provided kind and function, but there are no corresponding rows in the database
          // matching those query values. Thus, return no results.
          res.json([]);
        })
        .catch(next);
    },
    helper.findManyHandler(inputGetter),
  ];
};

module.exports.docs = function(modelExamples) {
  return {
    name: 'Fetch Member Signal Genes',
    description:
			'Returns an array of <a href="#signal-gene-model">Signal Genes</a> that belong to the genome identified by ${accession}.',
    example: {
      request: {
        parameters: {
          accession: modelExamples.Genome.version,
        },
      },
      response: {
        body: [modelExamples.SignalGene],
      },
    },
  };
};
