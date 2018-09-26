'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	const models = app.get('models')
	const helper = app.get('lib').RouteHelper.for(models.Gene)

	// eslint-disable-next-line
	/**
	 * Series of middleware functions that limit returning all genes for a particular genome.
	 */
	return [
		// 1. Parse the criteria - same old, same old here
		middlewares.parseCriteriaForMany(models.Gene, {
			accessibleModels: [
				models.Aseq,
				models.Dseq
			],
			maxPage: null,
			permittedOrderFields: '*'
		}),

		// 2. Now the tricky part. Our goal is to limit all genes to those associated with the
		//    genome identified in the exists middleware above. Thus, it is necessary to inner join
		//    the genes table to the components table (vs Sequelize's default left join) and
		//    specify the genome_id found earlier. This is accomplished by adding the Component
		//    model to the list of includes (with no attributes - no need to get these) in the
		//    criteria object.
		//
		//    If the Component model is also an accessibleModel (middleware #2), it would be
		//    necessary to upsert that include rather than simply pushing as is done below.
		(req, res, next) => {
			res.locals.criteria.include.push({
				model: models.Component,
				attributes: [],
				where: {
					genome_id: res.locals.genome.id
				},
				required: true
			})

			next()
		},

		// 3. Pass control to the default find handler which processes applies the
		//    res.locals.criteria to the primary model defined in the RouteHelper.
		helper.findManyHandler()
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Member Genes',
		description: 'Returns an array of <a href="#gene-model">Genes</a> that belong to the genome identified by ${accession}.',
		example: {
			request: {
				parameters: {
					accession: modelExamples.Genome.version
				}
			},
			response: {
				body: [
					modelExamples.Gene
				]
			}
		}
	}
}
