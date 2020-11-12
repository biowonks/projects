/* eslint-disable no-magic-numbers */

'use strict';

let memoryStream = require('./memory-stream');

describe('streams', function() {
  describe('memory stream', function() {
    it('undefined does not stream any data', function(done) {
      let reader = memoryStream(),
        result = 'dummy';
      reader.on('data', (string) => {
        result = string;
      })
        .on('end', () => {
          expect(result).equal('dummy');
          done();
        });
    });

    it('empty string works', function(done) {
      let reader = memoryStream(''),
        result = 'dummy';
      reader.on('data', (string) => {
        result = string;
      })
        .on('end', () => {
          expect(result).equal('dummy');
          done();
        });
    });

    it('\' \' string works', function(done) {
      let reader = memoryStream(' '),
        result = null;
      reader.on('data', (string) => {
        result = string;
      })
        .on('end', () => {
          expect(result).equal(' ');
          done();
        });
    });

    it('\'abcdef\' works in one pass (buffer size set to 10)', function(done) {
      let reader = memoryStream('abcdef', {highWaterMark: 10}),
        result = null;
      reader.on('data', (string) => {
        result = string;
      })
        .on('end', () => {
          expect(result).equal('abcdef');
          done();
        });
    });

    it('\'1234567890\' works in multiple passes (buffer size set to 3)', function(done) {
      let reader = memoryStream('1234567890', {highWaterMark: 3}),
        nDataCalls = 0,
        result = null;
      reader.on('data', (string) => {
        if (nDataCalls)
          result += string;
        else
          result = string;

        nDataCalls++;
      })
        .on('end', () => {
          expect(result).equal('1234567890');
          expect(nDataCalls).equal(4);
          done();
        });
    });
  });
});
