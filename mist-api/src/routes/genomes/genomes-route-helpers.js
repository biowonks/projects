'use strict'

// Local
const searchUtil = require('lib/util')

exports.genomeFinderMiddlewares = function(app, middlewares, inputGetter) {
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

    return [
        middlewares.parseCriteriaForMany(models.Genome, {
            accessibleModels: [
                models.WorkerModule,
                models.Component,
            ],
            permittedWhereFields: [
                'id',
				'taxonomy_id',
				'version',
                ...textFieldNames,
            ],
        }, inputGetter),
        (req, res, next) => {
            if (Reflect.has(inputGetter(req), 'search')) {
                searchUtil.assignExactMatchCriteria(inputGetter(req).search, res.locals, exactMatchFieldNames)
                searchUtil.assignPartialMatchCriteria(inputGetter(req).search, res.locals, textFieldNames)
            }
            next()
        },
        helper.findManyHandler(inputGetter)
    ]
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
