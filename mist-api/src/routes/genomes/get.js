'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome)

	return [
		middlewares.parseCriteriaForMany(models.Genome, {
			accessibleModels: [
				models.WorkerModule,
				models.Component
			],
			maxPage: null,
			permittedOrderFields: '*'
		}),
		// Split this out into a separate testable middleware
		(req, res, next) => {
			if (Reflect.has(req.query, 'query') && /\S/.test(req.query.query)) {
				const quotedTerms = []
				const queryWithoutQuotes = req.query.query.replace(/"([^"]*)"/g, (match, quotedWord) => {
					quotedTerms.push(quotedWord)
					return ''
				})
				const searchTerms = queryWithoutQuotes.split(/\s+/)
					.concat(quotedTerms)
					.map((word) => word.replace(/[^\w .]/g, '').trim()) // Allow word characters, spaces, and periods
					.filter((word) => !!word)
					.map((word) => `%${word}%`)
				res.locals.criteria.where = {
					name: {
						$iLike: {
							$any: searchTerms
						}
					}
				}
			}
			next()
		},
		helper.findManyHandler()
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
					modelExamples.Genome
				]
			}
		},
		har: null
	}
}
