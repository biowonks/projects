'use strict'

// Local
const util = require('./util')

describe('util', () => {
  describe('findNeighoringIndices', () => {
    const examples = [
      {
        index: 1,
        rangeStart: 1,
        rangeStop: 1,
        isCircular: false,
        options: {amount: 1},
        expect: [],
      },
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: false,
        options: {amount: 0},
        expect: [],
      },
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: false,
        options: {amount: 1},
        expect: [[1, 1], [3, 3]],
      },
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: false,
        options: {amountBefore: 1, amountAfter: 0},
        expect: [[1, 1]],
      },
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: false,
        options: {amountBefore: 0, amountAfter: 1},
        expect: [[3, 3]],
      },
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: false,
        options: {amount: 5},
        expect: [[1, 1], [3, 3]],
      },
      {
        index: 200,
        rangeStart: 150,
        rangeStop: 201,
        isCircular: false,
        options: {amount: 5},
        expect: [[195, 199], [201, 201]],
      },

      // Circular
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: true,
        options: {amount: 1},
        expect: [[1, 1], [3, 3]],
      },
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: true,
        options: {amountBefore: 2, amountAfter: 0},
        expect: [[1, 1], [3, 3]],
      },
      {
        index: 2,
        rangeStart: 1,
        rangeStop: 3,
        isCircular: true,
        options: {amountBefore: 0, amountAfter: 2},
        expect: [[3, 3], [1, 1]],
      },
      {
        index: 200,
        rangeStart: 150,
        rangeStop: 201,
        isCircular: true,
        options: {amount: 5},
        expect: [[195, 199], [201, 201], [150, 154]],
      },
    ]

    examples.forEach((example) => {
      const {index, rangeStart, rangeStop, isCircular, options} = example
      it(`index ${index} of [${rangeStart}..${rangeStop}], circular: ${isCircular}, options: ${JSON.stringify(options)} should return ${JSON.stringify(example.expect)}`, () => {
        const result = util.findNeighoringIndices(index, rangeStart, rangeStop, isCircular, options)
        expect(result).eql(example.expect)
      })
    })
  })

  describe('splitIntoTerms', () => {
    const examples = [
      {
        value: undefined,
        expect: [],
      },
      {
        value: null,
        expect: [],
      },
      {
        value: false,
        expect: ['false'],
      },
      {
        value: 0,
        expect: ['0'],
      },
      {
        value: 1,
        expect: ['1'],
      },
      {
        value: '',
        expect: [],
      },
      {
        value: ' ',
        expect: [],
      },
      {
        value: '\t \v \n \r',
        expect: [],
      },
      {
        value: '""',
        expect: [],
      },
      {
        value: ' " " ',
        expect: [],
      },
      {
        value: '\'',
        expect: [],
      },
      {
        value: 'protein',
        expect: ['protein'],
      },
      {
        value: ' protein ',
        expect: ['protein'],
      },
      {
        value: 'protein',
        expect: ['protein'],
      },
      {
        value: 'protein protein',
        expect: ['protein', 'protein'],
      },
      {
        value: 'alpha  dismutase',
        expect: ['alpha', 'dismutase'],
      },
      {
        value: '"alpha dismutase"',
        expect: ['alpha dismutase'],
      },
      {
        value: 'beta "alpha dismutase" barrel',
        expect: ['beta', 'alpha dismutase', 'barrel'],
      },
      {
        value: '"alpha dismutase',
        expect: ['alpha', 'dismutase'],
      },
      {
        value: '"alpha dismutase" "beta barrel"',
        expect: ['alpha dismutase', 'beta barrel'],
      },
      {
        value: '\'al\'pha\'',
        expect: ['alpha'],
      },
    ]

    examples.forEach((example) => {
      it(`${example.value} -> ${JSON.stringify(example.expect)}`, () => {
        let result = util.splitIntoTerms(example.value)
        expect(result).members(example.expect)
      })
    })
  })
})
