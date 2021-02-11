/* eslint-disable no-magic-numbers */

'use strict';

// Core
const fs = require('fs'),
  path = require('path');

// Local
const coilsStream = require('./coils-stream');

describe('streams', function() {
  describe('coils stream', function() {
    it('streaming prediction of coils', function(done) {
      let inputFile = path.resolve(__dirname, 'test-data', 'seqs-with-coiled-coils.faa'),
        inStream = fs.createReadStream(inputFile),
        coils = coilsStream(),
        results = [];

      // Any error within coils stream (including spawn problems) should make this test fail
      coils.on('error', done);

      inStream.pipe(coils)
        .on('data', (result) => {
          results.push(result);
        })
        .on('finish', () => {
          expect(results).deep.equal([
            {
              header: 'b0993',
              coils: [
                [130, 150],
                [222, 242],
                [409, 443],
              ],
            },
            {
              header: 'b2218',
              coils: [
                [449, 469],
              ],
            },
            {
              header: 'b2370',
              coils: [],
            },
            {
              header: 'b2786',
              coils: [
                [251, 289],
              ],
            },
            {
              header: 'b3210',
              coils: [
                [77, 132],
              ],
            },
          ]);
          done();
        });
    });
  });
});
