'use strict'

module.exports = function(app, middlewares, routeMiddlewares) {
  const { signalTransduction } = app.get('services')

  return [
    (req, res, next) => {
      signalTransduction.domainProfile(res.locals.genome.id)
      .then((domainProfile) => {
        res.json(domainProfile)
      })
      .catch(next)
    },
  ]
}
