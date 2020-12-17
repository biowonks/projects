'use strict';

module.exports = function(app, middlewares) {
  const models = app.get('models');

  // Ensure that the genome identified by the query parameter ${accession} exists. Note
  // that although the query parameter is labelled 'accession', the search is really done
  // against the genome version (accession plus its version number). The following
  // middlewares are not executed if this genome is not found. If it is found, the genome
  // will be available on res.locals.genome (by virtue of setting 'genome' for targetName)
  return middlewares.exists(models.Genome, {
    queryAttribute: 'version',
    paramName: 'accession',
    targetName: 'genome',
    attributes: ['id'], // Only return the genome id field
  });
};
