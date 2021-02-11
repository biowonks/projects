/* eslint-disable no-magic-numbers */

'use strict';

// Local
const serializeStream = require('./serialize-stream');

let createMockObject = function() {
  return {
    toString: () => {
      return 'toString was called\n';
    },
  };
};

describe('streams', function() {
  describe('serialize stream', function() {
    function writeAndExpect(inputs, expectedOutput, done, ...serializeArgs) {
      let x = serializeStream(...serializeArgs),
        result = '';

      for (let input of inputs)
        x.write(input);
      x.end();

      x.on('error', done)
        .on('data', (chunk) => {
          result += chunk;
        })
        .on('end', () => {
          expect(result).equal(expectedOutput);
          done();
        });
    }

    it('no arguments uses toString() for serialization', function(done) {
      writeAndExpect([{}, '\n', createMockObject()], '[object Object]\ntoString was called\n', done);
    });

    it('accepts a serialize function', function(done) {
      function convert(object, encoding) {
        return 'convert!\n';
      }

      writeAndExpect(
        [{}, ''],
        'convert!\n'.repeat(2),
        done,
        convert,
      );
    });

    it('accepts options and serialize function', function(done) {
      function squawk() {
        return 'squawk';
      }

      writeAndExpect([
        1,
        'abc',
      ], 'squawk'.repeat(2), done, {highWaterMark: 1}, squawk);
    });

    it('accepts null options and serialize function', function(done) {
      function squawk() {
        return 'squawk';
      }

      writeAndExpect([
        1,
        'abc',
      ], 'squawk'.repeat(2), done, null, squawk);
    });

    it('ndjson', function(done) {
      let x = serializeStream.ndjson(),
        object1 = {name: 'Luke'},
        object2 = {name: 'Ogun', married: true},
        result = '';

      x.write(object1);
      x.write(object2);
      x.end();

      x.on('error', done)
        .on('data', (chunk) => {
          result += chunk;
        })
        .on('end', () => {
          expect(result).equal(JSON.stringify(object1) + '\n' + JSON.stringify(object2) + '\n');
          done();
        });
    });
  });
});
