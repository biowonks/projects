'use strict';

// Core
const fs = require('fs');
const path = require('path');
const child_process = require('child_process'); // eslint-disable-line camelcase

// Vendor
const pumpify = require('pumpify');
const duplexChildProcess = require('duplex-child-process');

// Local
const config = require('../../../config');
const hmmpfamResultStream = require('./hmmpfam-result-stream');
const streamMixins = require('mist-lib/streams/stream-mixins');

// Constants
const kHmmpfamPath = path.resolve(config.vendor.hmmer2.binPath, 'hmmpfam');

/**
 * @param {string} hmmDatabaseFile - path to source hmm database file
 * @param {number} [z = null] - number of HMMs in hmmDatabaseFile by which to calculate the resulting E_values
 * @param {number} [cpus = null] - number of CPUs to use in parallel
 * @returns {DuplexStream} - expects FASTA input to be stream as input
 */
module.exports = function(hmmDatabaseFile, z = null, cpus = null) {
  if (!fs.existsSync(hmmDatabaseFile))
    throw new Error(`FATAL: hmmpfam target database, ${hmmDatabaseFile}, does not exist`);

  const stdinFileName = '-';
  const hmmpfamTool = duplexChildProcess.spawn(kHmmpfamPath, hmmpfamArgs(hmmDatabaseFile, stdinFileName, z, cpus));
  const parser = hmmpfamResultStream();
  const pipeline = pumpify.obj(hmmpfamTool, parser);

  streamMixins.all(pipeline);

  return pipeline;
};

/**
 * @param {string} hmmDatabaseFile - path to source hmm database file
 * @param {string} [fastaFile='-'] - path to fasta file to run hmmer against; defaults to '-' (STDIN)
 * @param {number} [z=null] - number of HMMs in hmmDatabaseFile by which to calculate the resulting E_values
 * @param {number} [cpus = null] - number of CPUs to use in parallel
 * @returns {Stream}
 */
module.exports.file = function(hmmDatabaseFile, fastaFile, z = null, cpus = null) {
  if (!fs.existsSync(hmmDatabaseFile))
    throw new Error(`FATAL: hmmpfam target database, ${hmmDatabaseFile}, does not exist`);

  if (typeof fastaFile !== 'string')
    throw new Error('fastaFile argument must be a string');

  const hmmpfamTool = child_process.spawn(kHmmpfamPath, hmmpfamArgs(hmmDatabaseFile, fastaFile, z, cpus));
  return pumpify.obj(hmmpfamTool.stdout, hmmpfamResultStream());
};

/**
 * @param {string} hmmDatabaseFile - path to source hmm database file
 * @param {string} [fastaFile='-'] - path to fasta file to run hmmer against; defaults to '-' (STDIN)
 * @param {number} [z=null] - number of HMMs in hmmDatabaseFile by which to calculate the resulting E_values
 * @param {number} [cpus = null] - number of CPUs to use in parallel
 * @returns {Array.<string>} - arguments to pass to hmmscan
 */
function hmmpfamArgs(hmmDatabaseFile, fastaFile = '-', z = null, cpus = null) {
  let args = ['--cut_ga'];
  if (z) {
    args.push('-Z');
    args.push(z);
  }
  if (cpus) {
    if (!/^[1-9]\d*$/.test(cpus))
      throw new Error('cpus argument must be a positive integer');

    args.push('--cpu');
    args.push(cpus);
  }
  args.push(hmmDatabaseFile);
  args.push(fastaFile);
  return args;
}
