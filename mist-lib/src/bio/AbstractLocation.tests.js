/* eslint-disable no-magic-numbers */
'use strict';

// Local
const AbstractLocation = require('./AbstractLocation'),
  MockLocation = require('./MockLocation');

describe('AbstractLocation', function() {
  const kIsCircular = true,
    kIsNotCircular = false;

  describe('length', function() {
    it('throws error if seqLength is not a number', function() {
      let x = new MockLocation(1, 10);
      expect(function() {
        x.length(kIsCircular);
      }).throw(Error);
    });

    it('throws error if the lowerBound > seqLength', function() {
      let x = new MockLocation(5, 10);
      expect(function() {
        x.length(kIsCircular, 3);
      }).throw(Error);
    });

    it('throws error if the upperBound > seqLength', function() {
      let x = new MockLocation(5, 10);
      expect(function() {
        x.length(kIsCircular, 9);
      }).throw(Error);
    });

    it('throws error if not circular and lower bound > upper bound', function() {
      let x = new MockLocation(5, 4);
      expect(function() {
        x.length(kIsNotCircular, 10);
      }).throw(Error);
    });

    it('circular and location does not wrap', function() {
      let x = new MockLocation(5, 10);
      expect(x.length(kIsCircular, 15)).equal(10 - 5 + 1);
    });

    it('circular and location wraps', function() {
      let x = new MockLocation(5, 2);
      expect(x.length(kIsCircular, 10)).equal(10 - 5 + 1 + 2);
    });

    it('not circular', function() {
      let x = new MockLocation(5, 10);
      expect(x.length(kIsNotCircular, 15)).equal(10 - 5 + 1);
    });
  });

  describe('lowerBound', function() {
    it('throws error', function() {
      let x = new AbstractLocation();
      expect(function() {
        x.lowerBound();
      }).throw(Error);
    });
  });

  describe('upperBound', function() {
    it('throws error', function() {
      let x = new AbstractLocation();
      expect(function() {
        x.upperBound();
      }).throw(Error);
    });
  });

  describe('overlaps', function() {
    it('throws error if not-circular and our location wraps', function() {
      let x = new MockLocation(5, 1),
        otherX = new MockLocation(5, 10);
      expect(function() {
        x.overlaps(otherX, kIsNotCircular, 10);
      }).throw(Error);
    });

    it('throws error if not-circular and other location wraps', function() {
      let x = new MockLocation(5, 10),
        otherX = new MockLocation(5, 1);
      expect(function() {
        x.overlaps(otherX, kIsNotCircular, 10);
      }).throw(Error);
    });

    let seqLength = 100,
      examples = [
        {
          a: [10, 20],
          b: [50, 70],
          isCircular: 'both',
          overlaps: false,
        },
        {
          a: [10, 30],
          b: [20, 40],
          isCircular: 'both',
          overlaps: true,
        },
        {
          a: [10, 90],
          b: [50, 70],
          isCircular: 'both',
          overlaps: true,
        },

        // Wrapping cases
        {
          a: [80, 20],
          b: [30, 40],
          isCircular: true,
          overlaps: false,
        },
        {
          a: [80, 20],
          b: [1, 10],
          isCircular: true,
          overlaps: true,
        },
        {
          a: [80, 20],
          b: [1, 30],
          isCircular: true,
          overlaps: true,
        },
        {
          a: [80, 20],
          b: [1, 90],
          isCircular: true,
          overlaps: true,
        },
        {
          a: [80, 20],
          b: [40, 81],
          isCircular: true,
          overlaps: true,
        },
        {
          a: [80, 20],
          b: [90, 95],
          isCircular: true,
          overlaps: true,
        },
        {
          a: [80, 20],
          b: [90, 25],
          isCircular: true,
          overlaps: true,
        },
      ];

    examples.forEach((example) => {
      let a1 = example.a[0],
        a2 = example.a[1],
        b1 = example.b[0],
        b2 = example.b[1],
        a = new MockLocation(a1, a2),
        b = new MockLocation(b1, b2),
        circulars = example.isCircular === 'both' ? [true, false] : [example.isCircular];

      circulars.forEach((isCircular) => {
        it(`(${a1}..${a2}) vs (${b1}..${b2}), circular: ${isCircular} --> ${example.overlaps}`, function() {
          expect(a.overlaps(b, isCircular, seqLength)).equal(example.overlaps);
        });

        it(`(${b1}..${b2}) vs (${a1}..${a2}), circular: ${isCircular} --> ${example.overlaps}`, function() {
          expect(b.overlaps(a, isCircular, seqLength)).equal(example.overlaps);
        });
      });
    });
  });

  describe('strand', function() {
    it('throws error', function() {
      let x = new AbstractLocation();
      expect(function() {
        x.strand();
      }).throw(Error);
    });
  });

  describe('transcriptFrom', function() {
    it('throws error', function() {
      let x = new AbstractLocation();
      expect(function() {
        x.transcriptFrom();
      }).throw(Error);
    });
  });
});
