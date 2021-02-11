'use strict';

// Vendor
const requestPromise = require('request-promise');

// Constants
const kDelayTimeBetweenEutilRequest = Math.ceil(1000 / 3); // No more than three requests per second allowed
const kDelayBetweenFailures = 1000;
const kRetryTimes = 5;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports =
class EUtilsService {
  constructor() {
    this.lastFetchTime = 0;
  }

  async fetch(url) {
    const msSinceLastRequest = Date.now() - this.lastFetchTime;
    const waitTime = Math.max(0, kDelayTimeBetweenEutilRequest - msSinceLastRequest);
    if (waitTime > 0) {
      await delay(waitTime);
    }

    const tries = Math.max(kRetryTimes, 0) + 1;
    for (let i = 0; i < tries; i++) {
      try {
        this.lastFetchTime = Date.now();
        return await requestPromise(url);
      } catch {
        console.log('Got an error waiting', kDelayBetweenFailures * (i + 1));
        await delay(kDelayBetweenFailures * (i + 1));
      }
    }

    throw new Error(`Failed to fetch URL over ${kRetryTimes} times: ${url}`);
  }
};
