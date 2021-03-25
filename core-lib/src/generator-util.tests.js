/* eslint-disable no-unused-expressions, no-magic-numbers, no-undefined */
'use strict';

// Local
const {
  batch,
  asyncBatch,
} = require('./generator-util');

describe('generator-util', function() {
  describe('batch', function() {
    it('empty array returns undefined', function() {
      const x = batch([]);
      const result = x.next();

      expect(result.value).not.ok;
      expect(result.done).true;
    });

    const examples = [
      {
        array: [1, 2],
        size: 0,
        expect: [],
      },
      {
        array: [1, 2],
        size: null,
        expect: [],
      },
      {
        array: [1, 2],
        size: undefined,
        expect: [],
      },
      {
        array: [1, 2],
        size: 1,
        expect: [[1], [2]],
      },
      {
        array: [1, 2],
        size: 2,
        expect: [[1, 2]],
      },
      {
        array: [1, 2, 3],
        size: 2,
        expect: [[1, 2], [3]],
      },
    ];

    examples.forEach((example) => {
      it(`batch(${JSON.stringify(example.array)}, ${example.size}) -> ${JSON.stringify(example.expect)}`, function() {
        const result = [];
        const x = batch(example.array, example.size);
        for (let i of x) {
          result.push(i);
        }

        expect(result).eql(example.expect);
      });
    });
  });

  describe('asyncBatch', () => {
    const makeAsyncIterator = (amount) => {
      return {
        [Symbol.asyncIterator]() {
          return {
            current: 0,
            async next() {
              if (this.current < amount) {
                return { done: false, value: this.current++ };
              }
              return { done: true };
            },
          };
        },
      };
    };

    it('should iterate over a 3 element array with batch size 2', async () => {
      const result = [];
      const iterator = makeAsyncIterator(3);
      for await (const chunk of asyncBatch(iterator, 2)) {
        result.push(chunk);
      }
      expect(result).eql([[0, 1], [2]]);
    });
  });
});
