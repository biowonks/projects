'use strict'

// Local
const Region = require('./Region')
const RegionContainer = require('./RegionContainer')

describe('RegionContainer', () => {
  describe('add', () => {
    it('adds a region', () => {
      const container = new RegionContainer()
      const r = new Region(1, 2)
      container.add(r)
      expect(container.regions).eql([r])
    })

    it('returns this', () => {
      const container = new RegionContainer()
      const r = new Region(1, 2)
      expect(container.add(r)).equal(container)
    })

    it('throws error if the same region is added twice', () => {
      expect(function() {
        const container = new RegionContainer()
        const r = new Region(1, 2)
        container.add(r).add(r)
      }).throw(Error)
    })
  })

  describe('findOverlaps', () => {
    it('returns regions have overlap a query', () => {
      const container = new RegionContainer()
      const r1 = new Region(1, 2)
      const r2 = new Region(5, 6)
      container.add(r1).add(r2)

      expect(container.findOverlaps(new Region(3, 4))).eql([])
      expect(container.findOverlaps(new Region(1, 6), 2)).eql([])
      const overlaps = container.findOverlaps(new Region(1, 3))
      expect(overlaps.length).equal(1)
      expect(overlaps[0].region).equal(r1)
    })
  })
})
