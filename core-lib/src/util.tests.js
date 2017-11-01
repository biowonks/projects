'use strict'

// Local
const util = require('./util')

describe('util', () => {
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
