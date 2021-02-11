/* eslint-disable no-magic-numbers */
'use strict';

// Local
const arrayUtil = require('./array-util');

describe('array-util', function() {
  describe('difference', function() {
    it('two empty arrays returns a new empty array', function() {
      const a = [];
      const b = [];
      const c = arrayUtil.difference(a, b);
      expect(a).not.equal(c);
      expect(b).not.equal(c);
      expect(c).eql([]);
    });

    const examples = [
      {
        a: [1],
        b: [],
        expect: [1],
      },
      {
        a: [],
        b: [1],
        expect: [],
      },
      {
        a: [1],
        b: [1],
        expect: [],
      },
      {
        a: [1, 2],
        b: [2],
        expect: [1],
      },
      {
        a: [1, 2],
        b: [2, 1],
        expect: [],
      },
      {
        a: [1, 2],
        b: ['1', '2', 3],
        expect: [1, 2],
      },
    ];

    examples.forEach((example) => {
      it(`${JSON.stringify(example.a)} difference ${JSON.stringify(example.b)} -> ${JSON.stringify(example.expect)}`, function() {
        const result = arrayUtil.difference(example.a, example.b);
        expect(result).eql(example.expect);
      });
    });
  });

  describe('flatten', function() {
    it('empty array returns new empty array', function() {
      const a = [];
      const result = arrayUtil.flatten(a);
      expect(result).not.equal(a);
      expect(result).eql([]);
    });

    const examples = [
      {
        a: [1, 2],
        expect: [1, 2],
      },
      {
        a: [1, [2]],
        expect: [1, 2],
      },
      {
        a: [[2], 1],
        expect: [2, 1],
      },
      {
        a: ['a', [1, 'b', [3], 'c'], {size: 'm'}],
        expect: ['a', 1, 'b', 3, 'c', {size: 'm'}],
      },
    ];

    examples.forEach((example) => {
      it(`${JSON.stringify(example.a)} -> ${JSON.stringify(example.expect)}`, function() {
        const result = arrayUtil.flatten(example.a);
        expect(result).eql(example.expect);
      });
    });
  });

  describe('indexObject', function() {
    it('indexes objects using default key of id', () => {
      const objects = [
        {id: 1, name: 'alpha'},
        {id: 2, name: 'beta'},
        {id: 3, name: 'gamma'},
      ];
      expect(arrayUtil.indexObjects(objects)).eql({
        1: objects[0],
        2: objects[1],
        3: objects[2],
      });
    });

    it('indexes objects using alternate key', () => {
      const objects = [
        {id: 1, name: 'alpha'},
        {id: 2, name: 'beta'},
        {id: 3, name: 'gamma'},
      ];
      expect(arrayUtil.indexObjects(objects, 'name')).eql({
        alpha: objects[0],
        beta: objects[1],
        gamma: objects[2],
      });
    });
  });

  describe('sortBy', function() {
    it('should sort objects using id field of order', () => {
      const objects = [
        {id: 1, name: 'alpha'},
        {id: 2, name: 'beta'},
        {id: 3, name: 'gamma'},
      ];
      const order = [2, 1, 3];
      const correct = [
        {id: 2, name: 'beta'},
        {id: 1, name: 'alpha'},
        {id: 3, name: 'gamma'},
      ];

      expect(arrayUtil.sortBy(objects, order)).eql(correct);
    });
  });
});
