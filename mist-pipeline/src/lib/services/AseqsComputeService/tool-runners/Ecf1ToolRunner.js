'use strict';

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner');
const ecfStream = require('lib/streams/ecf-stream');

module.exports =
class Ecf1ToolRunner extends FastaStreamToolRunner {
  handleResult_(aseq, result) {
    aseq.ecf1 = result.ecfs;
  }

  toolStream_() {
    return ecfStream(this.config_.databasePath, this.config_.z, this.config_.cpus);
  }
};

module.exports.meta = {
  id: 'ecf1',
  description: 'predict extra cytoplasmic factors (ECF)',
};
