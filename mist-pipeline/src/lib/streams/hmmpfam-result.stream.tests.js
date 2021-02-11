'use strict';

// Core
const path = require('path');
const fs = require('fs');

// Local
const hmmpfamResultStream = require('./hmmpfam-result-stream');

describe('streams', function() {
  describe('hmmpfam result stream (HMMER2)', function() {
    it('parses hmmpfam results', function(done) {
      // eslint-disable-next-line no-mixed-requires
      const inputFile = path.resolve(__dirname, 'test-data/hmmpfam-results.txt');
      const inStream = fs.createReadStream(inputFile, {highWaterMark: 1024});
      const hmmpfamResultReader = hmmpfamResultStream();
      const expectedResults = require('./test-data/hmmpfam-results'); // eslint-disable-line global-require
      const results = [];

      inStream
        .pipe(hmmpfamResultReader)
        .on('data', (result) => {
          results.push(result);
        })
        .on('finish', () => {
          expect(results).eql(expectedResults);
          done();
        });
    });
  });
});
