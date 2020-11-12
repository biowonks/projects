'use strict';

// Vendor
const requestPromise = require('request-promise');

// Constants
const kDelayTimeBetweenEutilRequest = 334; // No more than three requests per second allowed
const kDelayBetweenFailures = 1000;
const kRetryTimes = 5;

module.exports =
class EUtilsService {
  constructor() {
    this.lastFetchTime = 0;
  }

  fetch(url) {
    const startTime = new Date().getTime();
    const msSinceLastRequest = startTime - this.lastFetchTime;
    const waitTime = Math.max(0, kDelayTimeBetweenEutilRequest - msSinceLastRequest);
    let promise = Promise.reject();
    if (waitTime > 0)
      promise = Promise.delay(waitTime).then(() => promise);


    this.lastFetchTime = startTime;

    const tries = Math.max(kRetryTimes, 0) + 1;
    for (let i = 0; i < tries; i++) {
      promise = promise.catch(() => requestPromise(url))
        .catch(() => {
          return Promise.delay(kDelayBetweenFailures * (i + 1))
            .then(() => Promise.reject(new Error(`Failed to fetch URL over ${kRetryTimes} times: ${url}`)));
        });
    }
    return promise;
  }
};
