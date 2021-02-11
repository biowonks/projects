/* eslint-disable no-unused-expressions, no-magic-numbers, no-undefined */
'use strict';

// Local
const generatorUtil = require('./generator-util');

describe('generator-util', function() {
  describe('batch', function() {
    it('empty array returns undefined', function() {
      let x = generatorUtil.batch([]),
        result = x.next();

      expect(result.value).not.ok;
      expect(result.done).true;
    });

    let examples = [
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
        let result = [],
          x = generatorUtil.batch(example.array, example.size);
        for (let i of x)
          result.push(i);

        expect(result).eql(example.expect);
      });
    });
  });
});
