'use strict'

// Local
const Region = require('./Region')
const RegionContainer = require('./RegionContainer')
const st1utils = require('./st1-utils')

const kOriginalTolerance = st1utils.kTolerance

describe.only('removeOverlappingDomains', () => {
  afterEach(() => {
    st1utils.kTolerance = kOriginalTolerance
  })

  it('should sort input domains by ascending score', () => {
    const domains = [
      {ali_from: 1, ali_to: 2, score: 10},
      {ali_from: 3, ali_to: 4, score: 5},
    ]
    const container = new RegionContainer()
    st1utils.removeOverlappingDomains(container, domains)
    expect(domains).eql([
      {ali_from: 3, ali_to: 4, score: 5},
      {ali_from: 1, ali_to: 2, score: 10},
    ])
  })

  it('should not remove domains that overlap by the exported tolerance', () => {
    st1utils.kTolerance = 1
    const domain1 = {ali_from: 1, ali_to: st1utils.kTolerance, score: 10}
    const domain2 = {ali_from: 1, ali_to: st1utils.kTolerance, score: 20}
    const domains = [domain1, domain2]
    const container = new RegionContainer()
    st1utils.removeOverlappingDomains(container, domains)
    expect(domains).eql([domain1, domain2])
  })

  it('should remove the less scoring domain that overlaps by more than the tolerance', () => {
    st1utils.kTolerance = 1
    const domain1 = {ali_from: 1, ali_to: st1utils.kTolerance + 1, score: 10}
    const domain2 = {ali_from: 1, ali_to: st1utils.kTolerance + 2, score: 20}
    const domain3 = {ali_from: 1, ali_to: st1utils.kTolerance + 2, score: 30}
    const domains = [domain1, domain2, domain3]
    const container = new RegionContainer()
    st1utils.removeOverlappingDomains(container, domains)
    expect(domains).eql([domain3])
  })

  it('should remove the less scoring domain that overlaps by more than the tolerance (reverse domain order)', () => {
    st1utils.kTolerance = 1
    const domain1 = {ali_from: 1, ali_to: st1utils.kTolerance + 2, score: 30}
    const domain2 = {ali_from: 1, ali_to: st1utils.kTolerance + 2, score: 20}
    const domain3 = {ali_from: 1, ali_to: st1utils.kTolerance + 1, score: 10}
    const domains = [domain1, domain2, domain3]
    const container = new RegionContainer()
    st1utils.removeOverlappingDomains(container, domains)
    expect(domains).eql([domain1])
  })
})
