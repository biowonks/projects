'use strict';

// Vendor
const through2 = require('through2');

// Local
const GenbankMistAdapter = require('lib/GenbankMistAdapter');

module.exports = function(genomeId, genomeVersion) {
  let genbankMistAdapter = new GenbankMistAdapter(genomeId, genomeVersion);

  return through2.obj((genbankRecord, encoding, done) => {
    let mistData = null;
    try {
      mistData = genbankMistAdapter.formatRefSeq(genbankRecord);
    }
    catch (error) {
      done(error);
      return;
    }

    done(null, mistData);
  });
};
