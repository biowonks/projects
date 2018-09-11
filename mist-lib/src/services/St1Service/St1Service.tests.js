'use strict'

// local
const Domain = require('./Domain')
const St1Service = require('./St1Service')
const {
  AGFAM_TOOL_ID,
  ECF_TOOL_ID,
  MAX_HYBRID_RECEIVER_START,
  PFAM_TOOL_ID,
  THRESHOLD,
  PrimaryRank,
  SecondaryRank,
  pfamHKNonSignalDomains,
} = require('./stpi.constants')

describe('St1Service', () => {
  describe('analyze', () => {
    let stpiSpec = null
    beforeEach(() => {
      stpiSpec = [
        {
          accession: null,
          family: null,
          function: null,
          group: null,
          id: null,
          kind: null,
          marker: false,
          name: null,
        }
      ]
    })

    it('should return null for empty predictions', () => {
      const service = new St1Service(stpiSpec)
      expect(service.analyze({})).null
    })

    describe('non signaling HK should return null', () => {
      const hkSpecs = [
        {family: 'pfam', id: 'HK_CA', name: 'HATPase_c'},
        {family: 'pfam', id: 'HisKA', name: 'HisKA'},
        {family: 'agfam', id: 'HK_CA', name: 'HK_CA'},
      ]

      for (let hkSpec of hkSpecs) {
        const service = new St1Service(hkSpec)
        for (let hkNonSignalDomain of pfamHKNonSignalDomains) {
          it(`${hkSpec.family}:${hkSpec.id} domain with ${hkNonSignalDomain} should return null`, () => {
            const aseq = {
              [PFAM_TOOL_ID]: [
                new Domain(1, 100, 100, 1e-10, hkSpec.name).toHmmer3(),
                new Domain(101, 200, 100, 1e-10, hkNonSignalDomain).toHmmer3(),
              ]
            }
            const result = service.analyze(aseq)
            expect(result).null
          })
        }
      }
    })

    describe('chemotaxis', () => {

    })
  })
})
