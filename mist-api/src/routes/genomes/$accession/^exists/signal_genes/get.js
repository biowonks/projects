'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	const models = app.get('models')
  const helper = app.get('lib').RouteHelper.for(models.SignalGene)

  return [
    middlewares.parseCriteriaForMany(models.SignalGene, {
      accessibleModels: [
        models.Gene,
      ],
      maxPage: null,
      permittedOrderFields: '*',
      permittedWhereFields: [
        'id',
        'gene_id',
        'component_id',
      ],
    }),
    (req, res, next) => {
			res.locals.criteria.include.push({
				model: models.Component,
				attributes: ['name', 'version'],
				where: {
					genome_id: res.locals.genome.id
				},
				required: true
			})
      next()
    },
    helper.findManyHandler()
  ]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Member Signal Genes',
		description: 'Returns an array of <a href="#signal-gene-model">Signal Genes</a> that belong to the genome identified by ${accession}.',
		example: {
			request: {
				parameters: {
					accession: modelExamples.Genome.version
				}
			},
			response: {
				body: [
					modelExamples.SignalGene
				]
			}
		}
	}
}
