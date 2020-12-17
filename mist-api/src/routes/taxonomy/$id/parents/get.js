'use strict';

module.exports = function(app, middlewares, routeMiddlewares) {
  const	taxonomyService = app.get('services').taxonomy;

  return [
    (req, res, next) => {
      taxonomyService.fetchLineage(req.params.id)
        .then((result) => {
          res.json(result);
        });
    },
  ];
};

module.exports.docs = {
  name: 'Fetch Parent Taxonomy',
  description: 'Returns an array of parent taxonomic nodes',
};
