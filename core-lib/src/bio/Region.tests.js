/* eslint-disable no-new */

'use strict';

// Local
const Region = require('./Region');

describe('Region', () => {
  describe('construction', () => {
    it('throws error if start is zero', () => {
      expect(function() {
        new Region(0, 10);
      }).throw(Error);
    });

    it('throws error if start is negative', () => {
      expect(function() {
        new Region(-5, 10);
      }).throw(Error);
    });

    it('throws error if start is greater than stop', () => {
      expect(function() {
        new Region(2, 1);
      }).throw(Error);
    });
  });

  describe('data', () => {
    it('is undefined by default', () => {
      const x = new Region(1, 2);
      expect(x.data).undefined;
    });

    it('accepts arbitrary data', () => {
      const aseq = {length: 2, sequence: 'LR'};
      const x = new Region(1, 2, aseq);
      expect(x.data).equal(aseq);
    });
  });

  describe('findoverlap', () => {
    it('returns null if region is falsy', () => {
      expect(new Region(1, 2).findOverlap()).null;
      expect(new Region(1, 2).findOverlap(null)).null;
    });

    it('region completely inside query (type 1)', () => {
      // x:      --
      //         ||
      // query: ----
      //        1  4
      const x = new Region(2, 3);
      const query = new Region(1, 4);
      expect(x.findOverlap(query)).eql({
        amount: 2,
        queryDifference: 2,
        queryPercent: .5,
        region: x,
        subjectDifference: 0,
        subjectPercent: 1,
        type: 1,
      });
    });

    it('region completely inside query (type 1 + tolerance test)', () => {
      // x:      --
      //         ||
      // query: ----
      //        1  4
      const x = new Region(2, 3);
      const query = new Region(1, 4);
      const tolerance = 2;
      expect(x.findOverlap(query, tolerance)).null;
    });

    it('region completely contains query (type 2)', () => {
      //        1  4
      // x:     ----
      //         ||
      // query:  --
      const x = new Region(1, 4);
      const query = new Region(2, 3);
      expect(x.findOverlap(query)).eql({
        amount: 2,
        queryDifference: 0,
        queryPercent: 1,
        region: x,
        subjectDifference: 2,
        subjectPercent: .5,
        type: 2,
      });
    });

    it('region completely contains query (type 2 + tolerance)', () => {
      //        1  4
      // x:     ----
      //         ||
      // query:  --
      const x = new Region(1, 4);
      const query = new Region(2, 3);
      const tolerance = 2;
      expect(x.findOverlap(query, tolerance)).null;
    });

    it('tail of region overlaps head of query (type 3)', () => {
      //        1  4
      // x:     ----
      //          ||
      // query:   ----------
      //          3        10
      const x = new Region(1, 4);
      const query = new Region(3, 10);
      expect(x.findOverlap(query)).eql({
        amount: 2,
        queryDifference: 6,
        queryPercent: .25,
        region: x,
        subjectDifference: 2,
        subjectPercent: .5,
        type: 3,
      });
    });

    it('tail of region overlaps head of query (type 3 + tolerance test)', () => {
      //        1  4
      // x:     ----
      //          ||
      // query:   ----------
      //          3        10
      const x = new Region(1, 4);
      const query = new Region(3, 10);
      const tolerance = 2;
      expect(x.findOverlap(query, tolerance)).null;
    });

    it('head of region overlaps tail of query (type 4)', () => {
      //          3        10
      // x:       ----------
      //          ||
      // query: ----
      //        1  4
      const x = new Region(3, 10);
      const query = new Region(1, 4);
      expect(x.findOverlap(query)).eql({
        amount: 2,
        queryDifference: 2,
        queryPercent: .5,
        region: x,
        subjectDifference: 6,
        subjectPercent: .25,
        type: 4,
      });
    });

    it('head of region overlaps tail of query (type 4)', () => {
      //          3        10
      // x:       ----------
      //          ||
      // query: ----
      //        1  4
      const x = new Region(3, 10);
      const query = new Region(1, 4);
      const tolerance = 2;
      expect(x.findOverlap(query, tolerance)).null;
    });
  });

  describe('length', () => {
    it('1..1 returns 1', () => {
      expect(new Region(1, 1).length).equal(1);
    });

    it('1..2 returns 2', () => {
      expect(new Region(1, 2).length).equal(2);
    });
  });

  describe('start (getter)', () => {
    it('returns the start value', () => {
      expect(new Region(1, 2).start).equal(1);
    });
  });

  describe('start (setter)', () => {
    it('throws error if new start is 0', () => {
      expect(function() {
        const x = new Region(1, 2);
        x.start = 0;
      }).throw(Error);
    });

    it('throws error if new start is negative', () => {
      expect(function() {
        const x = new Region(1, 2);
        x.start = -1;
      }).throw(Error);
    });

    it('throws error if new start is greater than stop', () => {
      expect(function() {
        const x = new Region(1, 2);
        x.start = x.stop + 1;
      }).throw(Error);
    });

    it('correctly sets the start value', () => {
      const x = new Region(1, 2);
      x.start = 2;
      expect(x.start).equal(2);
      x.start = 1;
      expect(x.start).equal(1);
    });
  });

  describe('stop (getter)', () => {
    it('returns the stop value', () => {
      expect(new Region(1, 2).stop).equal(2);
    });
  });

  describe('stop (setter)', () => {
    it('throws error if new stop is less than start', () => {
      expect(function() {
        const x = new Region(1, 2);
        x.stop = x.start - 1;
      }).throw(Error);
    });

    it('correctly sets the stop value', () => {
      const x = new Region(1, 2);
      x.stop = 1;
      expect(x.stop).equal(1);
      x.stop = 2;
      expect(x.stop).equal(2);
    });
  });
});
