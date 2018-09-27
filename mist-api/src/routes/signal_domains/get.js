'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
	const models = app.get('models')
  const helper = app.get('lib').RouteHelper.for(models.SignalDomain)

  return [
		middlewares.parseCriteriaForMany(
      models.SignalDomain,
      {
        accessibleModels: [
          models.SignalDomainMember,
        ],
         // A big enough amount such that all are may be returned with one request
        defaultPerPage: 2500,
        maxPage: null,
        maxPerPage: 2500,
        permittedOrderFields: '*',
        permittedWhereFields: [
          'name',
          'version',
          'kind',
          'function',
        ],
      },
    ),
		helper.findManyHandler()
  ]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Signal Domains',
		description: 'Returns an array of <a href="#signal-domain-model">Signal Domains</a>.',
		method: null,
		uri: null,
		parameters: null,
		example: {
			response: {
				body: [
					modelExamples.SignalDomain
				]
			}
		},
		har: null
	}
}
