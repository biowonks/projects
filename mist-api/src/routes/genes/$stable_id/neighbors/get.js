'use strict'

// Vendor
const _ = require('lodash')
const validator = require('validator')

// Local
const arrayUtil = require('core-lib/array-util')

// Constants
const kDefaultNeighborAmount = 5
const kMaxNeighborAmount = 15

module.exports = function(app, middlewares, routeMiddlewares) {
  const models = app.get('models')
  const Gene = models.Gene

	return [
    middlewares.parseQueryParams(
      [
        {
          defaultValue: kDefaultNeighborAmount,
          hint: `the amount query parameter is optional and must be an integer between 0 and ${kMaxNeighborAmount}; defaults to ${kDefaultNeighborAmount}`,
          isValid: (value) => validator.isInt(value, {min: 0, max: kMaxNeighborAmount, allow_leading_zeroes: false}),
          paramName: 'amount',
          transform: parseInt,
        },
        {
          hint: `the amountBefore query parameter is optional and must be an integer between 0 and ${kMaxNeighborAmount}; defaults to ${kDefaultNeighborAmount} unless amount is provided`,
          isValid: (value) => validator.isInt(value, {min: 0, max: kMaxNeighborAmount, allow_leading_zeroes: false}),
          paramName: 'amountBefore',
          transform: parseInt,
        },
        {
          hint: `the amountAfter query parameter is optional and must be an integer between 0 and ${kMaxNeighborAmount}; defaults to ${kDefaultNeighborAmount} unless amount is provided`,
          isValid: (value) => validator.isInt(value, {min: 0, max: kMaxNeighborAmount, allow_leading_zeroes: false}),
          paramName: 'amountAfter',
          transform: parseInt,
        },
      ]
    ),
    middlewares.exists(Gene, {
      attributes: ['id', 'component_id'],
      paramName: 'stable_id',
      queryAttribute: 'stable_id',
      targetName: 'gene'
    }),
    (req, res, next) => {
      res.locals.gene.findNeighborIds({
        amount: res.locals.cleanQuery.amount,
        amountBefore: res.locals.cleanQuery.amountBefore,
        amountAfter: res.locals.cleanQuery.amountAfter,
      })
      .then((result) => {
        res.locals.neighborGeneIdRanges = result
        next()
      })
      .catch(next)
    },
		middlewares.parseCriteriaForMany(models.Gene, {
			accessibleModels: [
				models.Component,
				models.Aseq,
				models.Dseq
			]
		}),
		(req, res, next) => {
      // Finally! Retrieve the neighboring genes
      const { criteria, neighborGeneIdRanges } = res.locals

      if (!neighborGeneIdRanges.length) {
        res.json([])
        return
      }

      criteria.where = {
        $or: neighborGeneIdRanges.map((range) => {
          return {
            id: {
              $between: range,
            },
          }
        }),
      }
      criteria.limit = kMaxNeighborAmount * 2
      Gene.findAll(criteria)
      .then((entities) => {
        // Re-order entities to be "centered" around target gene
        const idLists = neighborGeneIdRanges.map((geneIdRange) => _.range(geneIdRange[0], geneIdRange[1] + 1))
        const sortedIds = arrayUtil.flatten(idLists)
        const sortedEntities = arrayUtil.sortBy(entities, sortedIds, 'id')
        res.json(sortedEntities)
      })
      .catch(next)
    },
	]
}
