'use strict';

module.exports = function(app, middlewares, routeMiddlewares) {
  const models = app.get('models');
  const helper = app.get('lib').RouteHelper.for(models.BioSample);

  return [
    middlewares.parseCriteriaForMany(models.BioSample, {
      accessibleModels: [
        models.Genome,
      ],
      permittedWhereFields: [
        'id',
      ],
    }),
    helper.findManyHandler(),
  ];
};

module.exports.docs = function(modelExamples) {
  return {
    name: 'Fetch many BioSamples',
    description: 'Returns an array of NCBI biosample records',
    example: {
      response: {
        body: [
          modelExamples.BioSample,
        ],
      },
    },
  };
};
