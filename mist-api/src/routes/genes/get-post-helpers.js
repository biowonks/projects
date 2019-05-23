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

  const specificMiddlewares = []
  if (isPOST) {
    specificMiddlewares.push(bodyParser.urlencoded({extended: false}))
  }

  specificMiddlewares.push(
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

  specificMiddlewares.push(
		(req, res, next) => {
			const userInput = isPOST ? req.body : req.query
			if (Reflect.has(userInput, 'search')) {
				searchUtil.assignExactMatchCriteria(userInput.search, res.locals, exactMatchFieldNames)
				// For the time being, only exact searches across a limited amount of fields
			}

			next()
    }
  )

  specificMiddlewares.push(helper.findManyHandler())

  return specificMiddlewares
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
