'use strict';

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner');
const hmmscanStream = require('lib/streams/hmmscan-stream');

module.exports =
class Agfam2ToolRunner extends FastaStreamToolRunner {
  handleResult_(aseq, result) {
    aseq.agfam2 = result.domains;
  }

  toolStream_() {
    const args = ['--noali', '--cut_ga'];
    if (this.config_.z) {
      args.push('-Z');
      args.push(this.config_.z);
    }
    if (this.config_.cpus) {
      args.push('--cpu');
      args.push(Number(this.config_.cpus));
    }

    return hmmscanStream(this.config_.databasePath, args);
  }
};

module.exports.meta = {
  id: 'agfam2',
  description: 'predict agfam2 domains',
};
