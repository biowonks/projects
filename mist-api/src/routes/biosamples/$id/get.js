'use strict';

module.exports = function(app, middlewares, routeMiddlewares) {
  const models = app.get('models');
  const helper = app.get('lib').RouteHelper.for(models.BioSample);

  return [
    middlewares.parseCriteria(models.BioSample, {
      accessibleModels: [
        models.Genome,
      ],
    }),
    helper.findHandler(),
  ];
};

module.exports.docs = function(modelExamples) {
  return {
    name: 'Fetch BioSample',
    description: 'Returns a single NCBI BioSample record',
    example: {
      request: {
        parameters: {
          id: modelExamples.BioSample.id,
        },
      },
      response: {
        body: modelExamples.BioSample,
      },
    },
  };
};
