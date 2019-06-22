'use strict'

const bodyParser = require('body-parser')

const searchUtil = require('lib/util')

exports.geneFinder = function(app, middlewares, isPOST = false) {
	const models = app.get('models')
	const helper = app.get('lib').RouteHelper.for(models.Gene)

	const exactMatchFieldNames = [
		'version',
		'locus',
		'old_locus',
		'stable_id',
	]

  const geneMiddlewares = []
  if (isPOST) {
    geneMiddlewares.push(bodyParser.urlencoded({extended: false}))
  }

  geneMiddlewares.push(
    middlewares.parseCriteriaForMany(models.Gene, {
			accessibleModels: [
				models.Genome,
				models.Component,
				models.Aseq,
				models.Dseq,
			],
			permittedWhereFields: [
				'id',
			],
    }, isPOST),
  )

  geneMiddlewares.push(
		(req, res, next) => {
      const userInput = isPOST ? req.body : req.query
			if (Reflect.has(userInput, 'search')) {
				searchUtil.assignExactMatchCriteria(userInput.search, res.locals, exactMatchFieldNames)
				// For the time being, only exact searches across a limited amount of fields
			}

			next()
    }
  )

  geneMiddlewares.push(helper.findManyHandler())

  return geneMiddlewares
}

exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Genes',
		description: 'Returns an array of genes',
		example: {
			response: {
				body: [
					modelExamples.Gene,
				],
			},
		},
	}
}
