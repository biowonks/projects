#!/usr/bin/env node

'use strict';

// Local
let MistBootService = require('../services/MistBootService');

let bootService = new MistBootService({
  applicationName: 'migrate',
  logger: {
    name: 'run-migrations',
  },
});

bootService.setup()
  .finally(() => bootService.sequelize().close());
