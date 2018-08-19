'use strict'

// Core
const path = require('path')

// Local
const Domain = require('./Domain')
const Region = require('./Region')
// const RegionContainer = require('./RegionContainer')
const st1utils = require('./st1-utils')

const kOriginalTolerance = st1utils.kTolerance

describe('st1 utils', () => {
  afterEach(() => {
    st1utils.kTolerance = kOriginalTolerance
  })

  describe('removeOverlappingDomains', () => {
    it('should sort input domains by ascending score', () => {
      const domain1 = new Domain(1, 2, 10)
      const domain2 = new Domain(3, 4, 5)
      const domains = [domain1, domain2]
      const container = new RegionContainer()
      st1utils.removeOverlappingDomains(container, domains)
      expect(domains).eql([domain2, domain1])
    })

    it('should not remove domains that overlap by the exported tolerance', () => {
      st1utils.kTolerance = 1
      const domain1 = new Domain(1, st1utils.kTolerance, 10)
      const domain2 = new Domain(1, st1utils.kTolerance, 20)
      const domains = [domain1, domain2]
      const container = new RegionContainer()
      st1utils.removeOverlappingDomains(container, domains)
      expect(domains).eql([domain1, domain2])
    })

    it('should remove the less scoring domain that overlaps by more than the tolerance', () => {
      st1utils.kTolerance = 1
      const domain1 = new Domain(1, st1utils.kTolerance + 1, 10)
      const domain2 = new Domain(1, st1utils.kTolerance + 2, 20)
      const domain3 = new Domain(1, st1utils.kTolerance + 2, 30)
      const domains = [domain1, domain2, domain3]
      const container = new RegionContainer()
      st1utils.removeOverlappingDomains(container, domains)
      expect(domains).eql([domain3])
    })

    it('should remove the less scoring domain that overlaps by more than the tolerance (reverse domain order)', () => {
      st1utils.kTolerance = 1
      const domain1 = new Domain(1, st1utils.kTolerance + 2, 30)
      const domain2 = new Domain(1, st1utils.kTolerance + 2, 20)
      const domain3 = new Domain(1, st1utils.kTolerance + 1, 10)
      const domains = [domain1, domain2, domain3]
      const container = new RegionContainer()
      st1utils.removeOverlappingDomains(container, domains)
      expect(domains).eql([domain1])
    })
  })

  describe('removeInsignificantOverlaps', () => {
    let threshold;
    beforeEach(() => {
      threshold = .001
    })

    it('should not remove any domains if only a single domain', () => {
      const domain = new Domain(1, 2, 10)
      const domains = [domain]
      st1utils.removeInsignificantOverlaps(domains, threshold)
      expect(domains).eql([domain])
    })

    it('should not remove any non-overlapping domains', () => {
      const a = new Domain(1, 2, 10, .1)
      const b = new Domain(3, 4, 10, .2)
      const c = new Domain(5, 6, 10, .15)
      const domains = [a, b, c]
      st1utils.removeInsignificantOverlaps(domains, threshold)
      expect(domains).eql([b, c, a])
    })

    it('should not remove any overlapping domains that only overlap by tolerance', () => {
      st1utils.kTolerance = 2
      const a = new Domain(10, 20, 100, .1)
      const b = new Domain(19, 30, 100, .2)
      const domains = [a, b]
      st1utils.removeInsignificantOverlaps(domains, threshold)
      expect(domains).eql([b, a])
    })

    it('should not remove any overlapping domains that overlap by more than tolerance but are close to the threshold', () => {
      st1utils.kTolerance = 2
      const a = new Domain(10, 20, 100, .1)
      const b = new Domain(18, 30, 100, .1)
      const domains = [a, b]
      st1utils.removeInsignificantOverlaps(domains, threshold)
      expect(domains).eql([a, b])
    })

    it('should remove any overlapping domains that overlap by more than tolerance and are outside threshold', () => {
      st1utils.kTolerance = 2
      const a = new Domain(10, 20, 100, .1)
      const b = new Domain(19, 30, 100, .2)
      const c = new Domain(18, 30, 100, .3)
      const domains = [a, b, c]
      st1utils.removeInsignificantOverlaps(domains, threshold)
      expect(domains).eql([b, a])
    })
  })

  describe('hasInsignificantOverlap', () => {
    it('should return false for empty array', () => {
      expect(st1utils.hasInsignificantOverlap([], .001)).false
    })

    it('should return false for a single domain with the same evalue', () => {
      const evalue = .005
      const domain = new Domain(1, 2, 10, evalue)
      const region = Region.createFromDomain(domain)
      const regions = [region]
      expect(st1utils.hasInsignificantOverlap(regions, evalue)).false
    })

    it('should return false for a single domain exactly threshold away from the target evalue', () => {
      const threshold = .001
      const evalue = .005
      const queryEvalue = evalue + threshold
      const domain = new Domain(1, 2, 10, evalue)
      const region = Region.createFromDomain(domain)
      const regions = [region]
      expect(st1utils.hasInsignificantOverlap(regions, queryEvalue, threshold)).false
    })

    it('should return true for a single domain greater than threshold away from the target evalue', () => {
      const threshold = .001
      const evalue = .005
      const queryEvalue = evalue + threshold + .0000009
      const domain = new Domain(1, 2, 10, evalue)
      const region = Region.createFromDomain(domain)
      const regions = [region]
      expect(st1utils.hasInsignificantOverlap(regions, queryEvalue, threshold)).true
    })

    it('should return true for a single domain less than threshold away from the target evalue', () => {
      const threshold = .001
      const evalue = .005
      const queryEvalue = evalue - threshold - .0000009
      const domain = new Domain(1, 2, 10, evalue)
      const region = Region.createFromDomain(domain)
      const regions = [region]
      expect(st1utils.hasInsignificantOverlap(regions, queryEvalue, threshold)).true
    })
  })

  describe('parseSTPISpec', () => {
    it('should correctly parse stpi file', () => {
      const file = path.resolve(__dirname, 'test-data/stpi-spec.tsv')
      return st1utils.parseSTPISpec(file)
        .then((spec) => {
          expect(spec).eql([
            {
              accession: 'AG00001',
              family: 'agfam',
              function: 'Receiver',
              group: null,
              id: 'RR',
              kind: 'receiver',
              marker: true,
              name: 'RR',
            },
            {
              accession: 'AG00025',
              family: 'agfam',
              function: 'Transmitter',
              group: 'HK',
              id: 'HK_CA',
              kind: 'transmitter',
              marker: true,
              name: 'HK_CA',
            },
            {
              accession: 'AG00002',
              family: 'agfam',
              function: 'Transmitter',
              group: null,
              id: 'HK_CA',
              kind: 'transmitter',
              marker: false,
              name: 'HK_CA:1',
            },
          ])
        })
    })
  })

  describe('getFamilyNameSet', () => {
    let spec
    beforeEach(() => {
      spec = [
        {
          family: 'agfam',
          name: 'RR',
        },
        {
          family: 'agfam',
          name: 'HK_CA',
        },
        {
          family: 'pfam',
          name: 'PAS',
        },
        {
          family: 'ecf',
          name: 'ECF_1',
        },
        {
          family: 'ecf',
          name: 'ECF_2',
        },
      ]
    })

    afterEach(() => {
      spec = undefined
    })

    it('should return the set of names that match the requested family', () => {
      const result = st1utils.getFamilyNameSet(spec, 'agfam')
      expect(Array.from(result)).members(['RR', 'HK_CA'])
    })

    it('should return empty set if there are no matches', () => {
      const result = st1utils.getFamilyNameSet(spec, 'invalid')
      expect(Array.from(result)).eql([])
    })
  })
})
