'use strict';

// Local
const FastaStreamToolRunner = require('./FastaStreamToolRunner');
const coilsStream = require('lib/streams/coils-stream');

module.exports =
class CoilsToolRunner extends FastaStreamToolRunner {
  handleResult_(aseq, result) {
    aseq.coils = result.coils;
  }

  toolStream_() {
    return coilsStream();
  }
};

module.exports.meta = {
  id: 'coils',
  description: 'identify coiled-coils',
};
