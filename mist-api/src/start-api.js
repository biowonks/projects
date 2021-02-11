/* eslint-disable no-console */
'use strict';

// Core
const path = require('path');

// Vendor
const pm2 = require('pm2');
const os = require('os');

// Local
const config = require('../config');

pm2.connect(() => {
  pm2.start({
    name: 'mist-api',
    script: path.resolve(__dirname, 'app.js'),
    execMode: 'cluster',
    instances: config.server.cpus,
    maxMemoryRestart: config.server.maxMemory + 'M',
    killTimeout: config.server.killTimeoutMs,
    restartDelay: config.server.restartDelayMs,
    watch: config.server.watch,
  }, (startError) => {
    if (startError) {
      console.error('Error while launching applications', startError.stack || startError);
      return;
    }

    // KeyMetrics logging
    const keyMetricsPrivateKey = process.env.KEYMETRICS_PRIVATE_KEY || config.KEYMETRICS_PRIVATE_KEY;
    const keyMetricsPublicKey = process.env.KEYMETRICS_PUBLIC_KEY || config.KEYMETRICS_PUBLIC_KEY;
    const keyMetricsMachineName = process.env.DYNO || os.hostname();
    if (keyMetricsPrivateKey && keyMetricsPublicKey && keyMetricsMachineName) {
      console.log('Connecting to KeyMetrics monitoring service');
      pm2.interact(keyMetricsPrivateKey, keyMetricsPublicKey, keyMetricsMachineName, () => {
        console.log('--> Success!');
        console.log('Launching communication bus');
        launchBus();
      });
    }
    else {
      console.log('Missing or incomplete KeyMetrics environment variables. Not connecting to KeyMetrics monitoring service');
      launchBus();
    }

    function launchBus() {
      console.log('PM2 and application have been successfully started');
      pm2.launchBus((error, bus) => {
        if (error) {
          throw error;
        }

        console.log('[PM2] Log streaming started');

        bus.on('log:out', (packet) => {
          // console.log('[%s] %s', packet.process.name, packet.data)
          process.stdout.write(packet.data);
        });

        bus.on('log:err', (packet) => {
          // console.error('[%s](Error) %s', packet.process.name, packet.data)
          process.stderr.write(packet.data);
        });
      });
    }
  });
});
