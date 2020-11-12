'use strict';

// Vendor
const pumpify = require('pumpify');
const through2 = require('through2');

// Local
const streamMixins = require('mist-lib/streams/stream-mixins');
const hmmpfamStream = require('lib/streams/hmmpfam-stream');

// Constants
const kNonSpecificEcfName = 'ECF_999';
const kSigmaDomainName = 'Sigma70_r3';

const isSpecific = (domains) => {
  for (let i = 0, z = domains.length; i < z; i++) {
    const domain = domains[i];
    if (domain.name !== kNonSpecificEcfName && /^ECF_/.test(domain.name))
      return true;
  }

  return false;
};

const hasSigmaDomain = (domains) => {
  for (let i = 0, z = domains.length; i < z; i++) {
    const domain = domains[i];
    if (domain.name === kSigmaDomainName)
      return true;
  }

  return false;
};

/**
 * @param {String} hmmDatabaseFile path to source ECF hmm database file
 * @param {Number} [z = null] number of HMMs in hmmDatabaseFile by which to calculate the resulting E_values
 * @param {Number} [cpus = null] number of CPUs to use in parallel
 * @param {Object} [throughOptions = null] stream options
 * @returns {DuplexStream} - expects FASTA input to be stream as input and outputs a non-empty array of ECF domains if predicted to be an ECF; otherwise an empty array
 */
module.exports = function(hmmDatabaseFile, z = null, cpus = null, throughOptions = null) {
  const pipeline = pumpify.obj(
    hmmpfamStream(hmmDatabaseFile, z, cpus),
    through2.obj(throughOptions, (hmmpfam, encoding, done) => {
      const {domains} = hmmpfam;

      let ecfs = null;
      if (isSpecific(domains) || (!hasSigmaDomain(domains) && domains.length > 0))
        ecfs = domains.sort((a, b) => b.score - a.score);
      else
        ecfs = [];


      const result = {
        ecfs,
        queryName: hmmpfam.queryName,
      };

      done(null, result);
    }),
  );

  streamMixins.all(pipeline);

  return pipeline;
};
