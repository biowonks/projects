'use strict';

// Core
const path = require('path'),
  fs = require('fs');

// Local
const hmmscanResultStream = require('./hmmscan-result-stream');

describe('streams', function() {
  describe('hmmscan result stream', function() {
    it('parses hmmscan results', function(done) {
      // eslint-disable-next-line no-mixed-requires
      let inputFile = path.resolve(__dirname, 'test-data/hmmscan-results.txt'),
        inStream = fs.createReadStream(inputFile, {highWaterMark: 1024}),
        hmmscanResultReader = hmmscanResultStream(),
        expectedResults = require('./test-data/hmmscan-results'), // eslint-disable-line global-require
        results = [];

      inStream
        .pipe(hmmscanResultReader)
        .on('data', (result) => {
          results.push(result);
        })
        .on('finish', () => {
          expect(results).deep.equal(expectedResults);
          done();
        });
    });
  });
});
