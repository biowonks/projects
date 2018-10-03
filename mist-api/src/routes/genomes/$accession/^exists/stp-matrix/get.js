'use strict'

const headerNames = require('core-lib/header-names')

module.exports = function(app, middlewares, routeMiddlewares) {
  const {
    criteria,
    signalTransduction,
  } = app.get('services')
  const models = app.get('models')
	const helper = app.get('lib').RouteHelper.for(models.SignalGene) // Model doesn't matter in this case

  return [
    (req, res, next) => {
      const limit = criteria.getPerPage(req.query)
      const page = criteria.getPage(req.query)
      const offset = criteria.offsetFromPage(page, limit)

      signalTransduction.stpMatrix(res.locals.genome.id, offset, limit)
      .then((stpMatrix) => {
        const totalCount = stpMatrix.numComponents
        res.append('Link', helper.linkHeaders(req, offset, limit, totalCount))
        res.append(headerNames.XTotalCount, totalCount)
        res.json(stpMatrix)
      })
      .catch(next)
    },
  ]
}
