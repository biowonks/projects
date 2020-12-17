'use strict';

const chai = require('chai');
const request = require('supertest');

const appFn = require('../app');

// --------------------------------------------------------
// One-time app
const harness = {
  app: null,
};

(function initialize() {
  global.expect = chai.expect;

  appFn()
    .then(function(app) {
      harness.app = app;
      harness.request = request;

      injectRoutePrefix(app.get('config').routing.prefix);
    });

  function injectRoutePrefix(prefix, optHttpVerbs) {
    if (!prefix) {
      return;
    }

    let httpVerbs = optHttpVerbs ? optHttpVerbs : ['get', 'post', 'put', 'delete'];
    httpVerbs.forEach(function(httpVerb) {
      let tmpFn = request[httpVerb];
      request[httpVerb] = function(partialUrl) {
        return tmpFn(prefix + partialUrl);
      };
    });
  }
})();

module.exports = function() {
  return harness;
};
