'use strict';

const bodyParser = require('body-parser');
const errors = require('../../lib/errors');

const queryLimit = 1000;

module.exports = function(app, middlewares, routeMiddlewares) {
  const models = app.get('models');
  const Aseq = models.Aseq;

  return [
    bodyParser.json(),
    (req, res, next) => {
      const aseqIds = req.body;
      const numAseqIds = aseqIds.length;
      if (numAseqIds > queryLimit) {
        const tooManyError = new errors.BadRequestError(`Too many items. Limit is set to ${queryLimit} entries.`);
        next(tooManyError);
        return;
      }

      for (let i = 0; i < numAseqIds; i++) {
        const aseqId = aseqIds[i];
        if (!Aseq.isValidId(aseqId)) {
          const invalidAseqError = new errors.BadRequestError(`Invalid item in position ${i}: ${aseqId}`);
          next(invalidAseqError);
          return;
        }
      }

      Aseq.findAll({
        where: {
          id: aseqIds,
        },
      })
        .then((result) => {
          res.json(result);
        })
        .catch(next);
    },
  ];
};
