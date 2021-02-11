'use strict';

// Core
const Transform = require('stream').Transform;

// Vendor
const split = require('split');
const pumpify = require('pumpify');

// Constants
const kRecordSeparator = /\n\/\//;
const kMinEntryLength = 100;

class HmmpfamResultStream extends Transform {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
  }

  _transform(entryText, encoding, done) {
    if (entryText.length < kMinEntryLength) {
      done();
      return;
    }

    const queryName = this.parseQueryName_(entryText);
    const domains = this.parseDomains_(entryText);

    // Sort by evalue asc, start asc, domain_id asc
    domains.sort((a, b) => a.evalue - b.evalue || a.start - b.start || a.name < b.name);

    this.push({domains, queryName});
    done();
  }

  // ----------------------------------------------------
  // Private methods
  parseQueryName_(entryText) {
    const matches = /\nQuery sequence:\s+(\S+)/.exec(entryText);
    return matches ? matches[1] : null;
  }

  parseDomains_(entryText) {
    //                          domain name        alifrom alito   ali_cov                hmmfrom hmmto   hmm_cov                score   E-value
    //                          $1                 $2      $3      $4                     $5      $6      $7                     $8      $9
    const regex = new RegExp(/\n(\S+)\s+\d+\/\d+\s+(\d+)\s+(\d+)\s+((?:\.|\[)(?:\.|\]))\s+(\d+)\s+(\d+)\s+((?:\.|\[)(?:\.|\]))\s+(\S+)\s+(\S+)/, 'g');
    let matches = regex.exec(entryText);
    let domains = [];
    while (matches !== null) {
      domains.push({
        name: matches[1],
        ali_from: parseInt(matches[2]),
        ali_to: parseInt(matches[3]),
        ali_cov: matches[4],
        hmm_from: parseInt(matches[5]),
        hmm_to: parseInt(matches[6]),
        hmm_cov: matches[7],
        score: parseFloat(matches[8]),
        evalue: parseFloat(matches[9]),
      });
      matches = regex.exec(entryText);
    }

    return domains;
  }
}

module.exports = function(options) {
  return pumpify.obj(split(kRecordSeparator), new HmmpfamResultStream(options));
};
