/* eslint-disable no-magic-numbers, no-new */
'use strict';

// Local
const ArrayLocation = require('./ArrayLocation'),
  MockLocation = require('./MockLocation'),
  Location = require('./Location'),
  LocationPoint = require('./LocationPoint');

describe('ArrayLocation', function() {
  describe('constructor', function() {
    it('throws with no arguments', function() {
      expect(function() {
        new ArrayLocation();
      }).throw(Error);
    });

    it('throws with empty locations array', function() {
      expect(function() {
        new ArrayLocation([]);
      }).throw(Error);
    });
  });

  describe('bounds', function() {
    let location1 = new Location(new LocationPoint(8), new LocationPoint(10)),
      location2 = new Location(new LocationPoint(1), new LocationPoint(2)),
      x = new ArrayLocation([location1, location2]);

    describe('lowerBound', function() {
      it('returns the first locations lower bound', function() {
        expect(x.lowerBound()).equal(location1.lowerBound());
      });
    });

    describe('upperBound', function() {
      it('returns the last locations upper bound', function() {
        expect(x.upperBound()).equal(location2.upperBound());
      });
    });
  });

  describe('length', function() {
    let notCircular = false,
      circular = true;

    it('linear order(1..2,5..6) is 4', function() {
      let location1 = new Location(new LocationPoint(1), new LocationPoint(2)),
        location2 = new Location(new LocationPoint(5), new LocationPoint(6)),
        x = new ArrayLocation([location1, location2]);

      expect(x.length(notCircular, 10)).equal(4);
    });

    it('linear order(5..6,1..2) is 4', function() {
      let location1 = new Location(new LocationPoint(5), new LocationPoint(6)),
        location2 = new Location(new LocationPoint(1), new LocationPoint(2)),
        x = new ArrayLocation([location1, location2]);

      expect(x.length(notCircular, 10)).equal(4);
    });

    it('circular order(8..1) length 10 returns 4', function() {
      let location = new Location(new LocationPoint(8), new LocationPoint(1)),
        x = new ArrayLocation([location]);

      expect(x.length(circular, 10)).equal(4);
    });
  });

  describe('overlaps', function() {
    let seqLength = 100,
      examples = [
        {
          a: [[10, 20], [80, 90]],
          b: [[50, 70]],
          isCircular: true,
          overlaps: false,
        },
        {
          a: [[80, 10], [30, 40]],
          b: [[11, 15], [22, 29], [55, 60]],
          isCircular: true,
          overlaps: false,
        },
        {
          a: [[80, 10], [30, 40]],
          b: [[35, 36]],
          isCircular: true,
          overlaps: true,
        },
      ];

    examples.forEach((example) => {
      let as = example.a.map((coords) => new MockLocation(coords[0], coords[1])),
        a = new ArrayLocation(as),
        aString = JSON.stringify(example.a),
        bs = example.b.map((coords) => new MockLocation(coords[0], coords[1])),
        b = new ArrayLocation(bs),
        bString = JSON.stringify(example.b),
        circulars = example.isCircular === 'both' ? [true, false] : [example.isCircular];

      circulars.forEach((isCircular) => {
        it(`(${aString}) vs (${bString}), circular: ${isCircular} --> ${example.overlaps}`, function() {
          expect(a.overlaps(b, isCircular, seqLength)).equal(example.overlaps);
        });

        it(`(${bString}) vs (${aString}), circular: ${isCircular} --> ${example.overlaps}`, function() {
          expect(b.overlaps(a, isCircular, seqLength)).equal(example.overlaps);
        });
      });
    });
  });

  describe('strand', function() {
    it('always returns +', function() {
      let location = new Location(new LocationPoint(1), new LocationPoint(3)),
        x = new ArrayLocation([location]);

      expect(x.strand()).equal('+');
    });
  });
});
