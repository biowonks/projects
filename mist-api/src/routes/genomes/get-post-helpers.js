'use strict'

const bodyParser = require('body-parser')
// Local
const searchUtil = require('lib/util')

exports.genomeFinder = function(app, middlewares, isPOST = false) {
	const models = app.get('models')
    const helper = app.get('lib').RouteHelper.for(models.Genome)

    const exactMatchFieldNames = ['version']
	const textFieldNames = [
		'name',
		'superkingdom',
		'phylum',
		'class',
		'order',
		'family',
		'genus',
		'assembly_level',
	]
    const specificMiddlewares = []
    if (isPOST) {
        specificMiddlewares.push(bodyParser.urlencoded({extended: false}))
    }

    specificMiddlewares.push(
        middlewares.parseCriteriaForMany(models.Genome, {
            accessibleModels: [
                models.WorkerModule,
                models.Component,
            ],
            permittedWhereFields: [
                'id',
                'taxonomy_id',
                ...textFieldNames,
            ],
        }, isPOST),
    )

    specificMiddlewares.push(
        (req, res, next) => {
            const userInput = isPOST ? req.body : req.query
            if (Reflect.has(userInput, 'search')) {
                searchUtil.assignExactMatchCriteria(userInput.search, res.locals, exactMatchFieldNames)
                searchUtil.assignPartialMatchCriteria(userInput.search, res.locals, textFieldNames)
            }
            next()
        }
    )

    specificMiddlewares.push(helper.findManyHandler())

    return specificMiddlewares
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Genomes',
		description: 'Returns an array of <a href="#genome-model">Genomes</a>.',
		method: null,
		uri: null,
		parameters: null,
		example: {
			response: {
				body: [
					modelExamples.Genome,
				],
			},
		},
		har: null
	}
}
