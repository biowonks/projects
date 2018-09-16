'use strict'

// Local
const Domain = require('./Domain')
const St1Service = require('./St1Service')
const {
  AGFAM_TOOL_ID,
  ECF_TOOL_ID,
  MAX_HYBRID_RECEIVER_START,
  MAX_HisKA_CA_SEPARATION,
  MAX_HK_CA_SEPARATION,
  PFAM_TOOL_ID,
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
      const hkSpec = [
        {family: 'pfam', id: 'HK_CA', name: 'HATPase_c', marker: true},
        {family: 'pfam', id: 'HisKA', name: 'HisKA', marker: true},
        {family: 'agfam', id: 'HK_CA', name: 'HK_CA', marker: true},
      ]

      const service = new St1Service(hkSpec)
      for (let row of hkSpec) {
        for (let hkNonSignalDomain of pfamHKNonSignalDomains) {
          it(`${row.family}:${row.id} domain with ${hkNonSignalDomain} should return null`, () => {
            const aseq = {
              [PFAM_TOOL_ID]: [
                new Domain(1, 100, 100, 1e-10, row.name).toHmmer3(),
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
      const spec = [
        {family: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', marker: true},
        {family: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', marker: true},
        {family: 'pfam', id: 'HPt', kind: 'transmitter', name: 'HPt', marker: true},
        {family: 'pfam', id: 'CheW', kind: 'chemotaxis', name: 'CheW', marker: true},
        {family: 'pfam', id: 'CheB_methylest', kind: 'chemotaxis', name: 'CheB_methylest', marker: true},
        {family: 'pfam', id: 'CheR', kind: 'chemotaxis', name: 'CheR', marker: true},
        {family: 'pfam', id: 'CheW', kind: 'chemotaxis', name: 'CheW', marker: true},
        {family: 'pfam', id: 'CheR_N', kind: 'chemotaxis', name: 'CheR_N', marker: true},
        {family: 'pfam', id: 'CheD', kind: 'chemotaxis', name: 'CheD', marker: true},
        {family: 'pfam', id: 'CheZ', kind: 'chemotaxis', name: 'CheZ', marker: true},
        {family: 'pfam', id: 'CheC', kind: 'chemotaxis', name: 'CheC', marker: true},
        {family: 'pfam', id: 'MCPsignal', kind: 'chemotaxis', name: 'MCPsignal', marker: true},
        {family: 'agfam', id: 'HK_CA:Che', kind: 'chemotaxis', name: 'HK_CA:Che', marker: true},
      ]
      const service = new St1Service(spec)

      const testSets = [
        {
          domains: ['CheW', 'HPt'],
          secondaryRank: SecondaryRank.chea,
        },
        {
          domains: ['CheW', 'Response_reg'],
          secondaryRank: SecondaryRank.chev,
        },
        {
          domains: ['CheW'],
          secondaryRank: SecondaryRank.chew,
        },
        {
          domains: ['CheB_methylest'],
          secondaryRank: SecondaryRank.cheb,
        },
        {
          domains: ['CheR'],
          secondaryRank: SecondaryRank.cher,
        },
        {
          domains: ['CheR_N'],
          secondaryRank: SecondaryRank.cher,
        },
        {
          domains: ['CheD'],
          secondaryRank: SecondaryRank.ched,
        },
        {
          domains: ['CheZ'],
          secondaryRank: SecondaryRank.chez,
        },
        {
          domains: ['CheC'],
          secondaryRank: SecondaryRank.checx,
        },
        {
          domains: ['CheC', 'SpoA'],
          secondaryRank: SecondaryRank.other,
        },
        {
          domains: ['MCPsignal'],
          secondaryRank: SecondaryRank.mcp,
        },
      ]

      testSets.forEach((testSet) => {
        it(`should have a ${testSet.secondaryRank} for ${testSet.domains.join(', ')}`, () => {
          const domains = testSet.domains.map((name, i) => new Domain(i*100 + 1, i*100 + 100, 100, 1e-10, name).toHmmer3())
          const aseq = {
            [PFAM_TOOL_ID]: domains
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.chemotaxis, testSet.secondaryRank])
        })
      })

      it('should have a chea secondary rank when it has CheW or HK_CA:Che', () => {
        const aseq = {
          [PFAM_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'CheW').toHmmer3(),
          ],
          [AGFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'HK_CA:Che').toHmmer3(),
          ]
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.chemotaxis, SecondaryRank.chea])
      })
    })

    describe('two-component systems', () => {
      const spec = [
        {family: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', marker: true},
        {family: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', marker: true},
        {family: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', marker: true},
        {family: 'pfam', id: 'HPT', kind: 'transmitter', name: 'HPT', marker: true},
        {family: 'agfam', id: 'HK_CA', kind: 'transmitter', name: 'HK_CA', marker: true},
        {family: 'agfam', id: 'RR', kind: 'receiver', name: 'RR', marker: true},
      ]
      const service = new St1Service(spec)

      describe('hybrid (receiver + histidine kinase)', () => {
        it(`should return ${PrimaryRank.tcp} + ${SecondaryRank.hrr} if first receiver is N-terminal to first histidine kinase and this receiver is within ${MAX_HYBRID_RECEIVER_START} aa of the N-terimnus`, () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(MAX_HYBRID_RECEIVER_START, MAX_HYBRID_RECEIVER_START + 100, 100, 1e-10, 'Response_reg').toHmmer3(),
              new Domain(MAX_HYBRID_RECEIVER_START + 120, MAX_HYBRID_RECEIVER_START + 120 + 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
            ]
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.hrr])
        })

        it(`should return ${PrimaryRank.tcp} + ${SecondaryRank.other} if first receiver is N-terminal to first histidine kinase and this receiver is greater than ${MAX_HYBRID_RECEIVER_START} aa away from the N-terminus`, () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(MAX_HYBRID_RECEIVER_START+1, MAX_HYBRID_RECEIVER_START + 100, 100, 1e-10, 'Response_reg').toHmmer3(),
              new Domain(MAX_HYBRID_RECEIVER_START + 120, MAX_HYBRID_RECEIVER_START + 120 + 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.other])
        })

        it(`should return ${PrimaryRank.tcp} + ${SecondaryRank.hhk} if first receiver occurs after a histidine kinase`, () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
              new Domain(120, 120 + 100, 100, 1e-10, 'Response_reg').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.hhk])
        })
      })

      describe(`${PrimaryRank.tcp} + ${SecondaryRank.hk}`, () => {
        it('if has pfam HATPase domain', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.hk])
        })

        it('if has pfam HisKA domain', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HisKA').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.hk])
        })

        it('if has agfam HK_CA domain', () => {
          const aseq = {
            [AGFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HK_CA').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.hk])
        })
      })

      describe(`${PrimaryRank.tcp} + ${SecondaryRank.rr}`, () => {
        it('if has pfam Response_reg domain', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'Response_reg').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.rr])
        })

        it('if has agfam RR domain', () => {
          const aseq = {
            [AGFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'RR').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.rr])
        })
      })

      describe(`${PrimaryRank.tcp} + ${SecondaryRank.other}`, () => {
        it('if has transmitter domain, but no hatpase or receiver domains', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HPT').toHmmer3(),
            ],
          }
          const result = service.analyze(aseq)
          expect(result.ranks).eql([PrimaryRank.tcp, SecondaryRank.other])
        })
      })
    })

    describe('ECF ranks', () => {
      const spec = [
        {family: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_1', marker: true},
        {family: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_999', marker: false},
        {family: 'pfam', id: 'ECF', kind: 'ecf', name: 'Sigma70_ECF', marker: true},
        {family: 'pfam', id: 'ECF', kind: 'ecf', name: 'SomeECF', marker: false},
      ]
      const service = new St1Service(spec)

      it(`should return ${PrimaryRank.ecf} if has ECF marker and pfam Sigma70_r2 domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'Sigma70_r2').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ecf])
      })

      it(`should return ${PrimaryRank.ecf} if has ECF marker and pfam Sigma70_r4 domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'Sigma70_r4').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ecf])
      })

      it(`should return ${PrimaryRank.ecf} if has ECF marker and pfam Sigma70_r4_2 domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'Sigma70_r4_2').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ecf])
      })

      it(`should return ${PrimaryRank.ecf} if has ECF marker and pfam ECF domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'SomeECF').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ecf])
      })

      it(`should return ${PrimaryRank.ecf} if has pfam ECF marker`, () => {
        const aseq = {
          [PFAM_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'Sigma70_ECF').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ecf])
      })

      it(`should return ${PrimaryRank.other} if has ECF marker by itself`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ecf])
      })
    })

    describe('one-component systems', () => {
      const spec = [
        {family: 'pfam', id: 'HTH_1', kind: 'output', name: 'HTH_1', marker: true},
        {family: 'agfam', id: 'DNA-binder', kind: 'output', name: 'SomeHTH', marker: true},
      ]
      const service = new St1Service(spec)

      it(`should return ${PrimaryRank.ocp} if has pfam output`, () => {
        const aseq = {
          [PFAM_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'HTH_1').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ocp])
      })

      it(`should return ${PrimaryRank.ocp} if has agfam output`, () => {
        const aseq = {
          [AGFAM_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'SomeHTH').toHmmer3(),
          ],
        }
        const result = service.analyze(aseq)
        expect(result.ranks).eql([PrimaryRank.ocp])
      })
    })
  })

  describe('analyzeAgfamDomains_', () => {
    const spec = [
      {family: 'agfam', id: 'HK_CA', kind: 'transmitter', name: 'HK_CA', marker: true},
      {family: 'agfam', id: 'HK_CA:Che', kind: 'transmitter', name: 'HK_CA:Che', marker: true},
      {family: 'agfam', id: 'RR', kind: 'receiver', name: 'RR', marker: true},
      {family: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', marker: true},
      {family: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', marker: true},
      {family: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', marker: true},
      {family: 'pfam', id: 'HPT', kind: 'transmitter', name: 'HPT', marker: true},
    ]
    const service = new St1Service(spec)

    it('should remove equivalent pfam signaling domains that overlap with the agfam signal domains', () => {
      const nonSignalingAgfamDomain = new Domain(101, 200, 100, 1e-10, 'unknown')
      const agfamDomains = [
        new Domain(1, 100, 100, 1e-10, 'HK_CA'),
        nonSignalingAgfamDomain,
      ]
      const pfamDomains = [
        new Domain(50, 150, 100, 1e-10, 'HATPase_c'),
      ]

      const result = service.analyzeAgfamDomains_(agfamDomains, pfamDomains);
      expect(result).eql([spec[0]])
      expect(agfamDomains.length).equal(2)
      expect(pfamDomains).empty
    })

    it(`with signal domain HK_CA should remove upstream pfam HisKA domains within ${MAX_HisKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HisKA_CA_SEPARATION, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains);
      expect(pfamDomains).empty
    })

    it(`with signal domain HK_CA should not remove upstream pfam HisKA domains greater than ${MAX_HisKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HisKA_CA_SEPARATION - 1, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains);
      expect(pfamDomains.length).equal(1)
    })

    it(`with signal domain HK_CA should not remove downstream pfam HisKA domains`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA'),
      ]
      const pfamDomains = [
        new Domain(201, 250, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains);
      expect(pfamDomains.length).equal(1)
    })

    it(`with signal domain HK_CA:Che should remove upstream pfam HisKA domains within ${MAX_HisKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA:Che'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HisKA_CA_SEPARATION, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains);
      expect(pfamDomains).empty
    })

    it(`with signal domain HK_CA:Che should not remove upstream pfam HisKA domains greater than ${MAX_HisKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA:Che'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HisKA_CA_SEPARATION - 1, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains);
      expect(pfamDomains.length).equal(1)
    })
  })

  describe('analyzePfamDomains_', () => {
    const spec = [
      {family: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', marker: true},
      {family: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', marker: true},
      {family: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', marker: true},
      {family: 'pfam', id: 'GntR', kind: 'output', name: 'GntR', marker: true},
    ]
    const service = new St1Service(spec)

    it('should not return non-signaling domans', () => {
      const pfamDomains = [
        new Domain(1, 100, 100, 1e-10, 'other'),
      ]
      const result = service.analyzePfamDomains_(pfamDomains)
      expect(result).eql([])
    })

    it('should return the list of pfam signal domains', () => {
      const pfamDomains = [
        new Domain(1, 100, 100, 1e-10, 'Response_reg'),
        new Domain(101, 200, 100, 1e-10, 'GntR'),
        new Domain(301, 300, 100, 1e-10, 'GntR'),
      ]

      const ResponseRegSignalDomain = spec[0]
      const GntRSignalDomain = spec[3]
      const result = service.analyzePfamDomains_(pfamDomains)
      expect(result).eql([
        ResponseRegSignalDomain,
        GntRSignalDomain,
        GntRSignalDomain,
      ])
    })

    it(`should not remove pairs of HK_CA domains that are greater than ${MAX_HK_CA_SEPARATION} aa apart`, () => {
      const pfamDomains = [
        new Domain(1, 100, 100, 1e-10, 'HATPase_c'),
        new Domain(100 + MAX_HK_CA_SEPARATION + 1, 100 + MAX_HK_CA_SEPARATION + 100, 100, 1e-10, 'HATPase_c'),
      ]
      const HKSignalDomain = spec[1]
      const result = service.analyzePfamDomains_(pfamDomains)
      expect(result).eql([HKSignalDomain, HKSignalDomain])
    })

    it(`should remove pairs of HK_CA domains that are <= than ${MAX_HK_CA_SEPARATION} aa apart`, () => {
      const pfamDomains = [
        new Domain(1, 100, 100, 1e-10, 'HATPase_c'),
        new Domain(100 + MAX_HK_CA_SEPARATION, 100 + MAX_HK_CA_SEPARATION + 100, 100, 1e-10, 'HATPase_c'),
      ]
      const HKSignalDomain = spec[1]
      const result = service.analyzePfamDomains_(pfamDomains)
      expect(result).eql([HKSignalDomain])
    })
  })

  describe('analyzeEcfDomains_', () => {
    const ECF_1 = {family: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_1', marker: true, function: 'ECF'};
    const ECF_2 = {family: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_2', marker: true, function: 'ECF'};
    const service = new St1Service([ECF_1, ECF_2])

    it('should return the non-overlapping ECF signaling domains', () => {
      const a = new Domain(1, 100, 100, 1e-5, 'ECF_1')
      const b = new Domain(1, 100, 100, 1e-10, 'ECF_2')
      const ecfDomains = [a, b]
      const result = service.analyzeEcfDomains_(ecfDomains)
      expect(result).eql([ECF_2])
    })
  })

  describe('summarize_', () => {
    const agfamHK_CA = {family: 'agfam', id: 'HK_CA', kind: 'transmitter', name: 'HK_CA', marker: true, function: 'Transmitter'};
    const pfamRR = {family: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', marker: true, function : 'Receiver'};
    const pfamHK_CA = {family: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', marker: true, function: 'Transmitter'};
    const pfamHisKA = {family: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', marker: true, function: 'Transmitter'};
    const Cache = {family: 'pfam', id: 'Cache', kind: 'input', name: 'Cache', marker: false, function: 'Small molecule binding'};
    const PAS = {family: 'pfam', id: 'PAS', kind: 'input', name: 'PAS', marker: false, function: 'Small molecule binding'};
    const Citrate_synt = {family: 'pfam', id: 'Citrate_synt', kind: 'input', name: 'Citrate_synt', marker: false, function: 'Enzymatic'};
    const GntR = {family: 'pfam', id: 'GntR', kind: 'output', name: 'GntR', marker: true, function: 'DNA-binding'};
    const GerE = {family: 'pfam', id: 'GerR', kind: 'output', name: 'GerR', marker: true, function: 'DNA-binding'};
    const PKinase = {family: 'pfam', id: 'PKinase', kind: 'output', name: 'PKinase', marker: true, function: 'Protein kinase'};
    const ECF_1 = {family: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_1', marker: true, function: 'ECF'};
    const spec = [
      agfamHK_CA,
      pfamRR,
      pfamHK_CA,
      pfamHisKA,
      Cache,
      PAS,
      Citrate_synt,
      GntR,
      GerE,
      PKinase,
      ECF_1,
    ];
    const service = new St1Service(spec)

    it('agfam HK_CA plus pfam HK_CA should count as 2 doamin counts', () => {
      const ranks = []
      const result = service.summarize_([
        agfamHK_CA,
        agfamHK_CA,
        pfamHK_CA,
      ], ranks)
      expect(result.domainCounts).eql({
        [agfamHK_CA.id]: 3,
      })
    })

    it('multiple distinct domain counts', () => {
      const ranks = []
      const result = service.summarize_([Cache, PAS, ECF_1], ranks)
      expect(result.domainCounts).eql({
        [Cache.id]: 1,
        [PAS.id]: 1,
        [ECF_1.id]: 1,
      })
    })

    it('should only include distinct sets of input domains and input functions', () => {
      const ranks = []
      const result = service.summarize_([Cache, Cache, PAS, PAS, Citrate_synt, GerE], ranks)
      expect(result.inputDomains).members([Cache.id, PAS.id, Citrate_synt.id]);
      expect(result.inputFunctions).members([Cache.function, PAS.function, Citrate_synt.function]);
    })

    it('should only include distinct sets of output domains and output functions', () => {
      const ranks = []
      const result = service.summarize_([Cache, GerE, GerE, PKinase], ranks)
      expect(result.outputDomains).members([GerE.id, PKinase.id]);
      expect(result.outputFunctions).members([GerE.function, PKinase.function]);
    })

    it('should include the ranks', () => {
      const ranks = [PrimaryRank.tcp, SecondaryRank.hrr]
      const result = service.summarize_([], ranks)
      expect(result.ranks).eql(ranks)
    })

    it('if primary rank of ECF should not include DNA-binding output in the function sets', () => {
      const ranks = [PrimaryRank.ecf]
      const result = service.summarize_([GerE, PKinase], ranks)
      expect(result.outputFunctions).eql([PKinase.function])
    })

    it('should not include receiver functions in the input or output domains and functions', () => {
      const ranks = []
      const result = service.summarize_([pfamRR], ranks)
      expect(result).eql({
        domainCounts: {
          [pfamRR.id]: 1,
        },
        inputDomains: [],
        inputFunctions: [],
        outputDomains: [],
        outputFunctions: [],
        ranks,
      })
    })

    it('should not include transmitter functions in the input or output domains and functions', () => {
      const ranks = []
      const result = service.summarize_([agfamHK_CA], ranks)
      expect(result).eql({
        domainCounts: {
          [agfamHK_CA.id]: 1,
        },
        inputDomains: [],
        inputFunctions: [],
        outputDomains: [],
        outputFunctions: [],
        ranks,
      })
    })

    it('should not include ecf functions in the input or output domains and functions', () => {
      const ranks = []
      const result = service.summarize_([ECF_1], ranks)
      expect(result).eql({
        domainCounts: {
          [ECF_1.id]: 1,
        },
        inputDomains: [],
        inputFunctions: [],
        outputDomains: [],
        outputFunctions: [],
        ranks,
      })
    })

    it('composite test', () => {
      const ranks = [PrimaryRank.tcp, SecondaryRank.other]
      const result = service.summarize_([
        Cache,
        PAS,
        PAS,
        pfamHisKA,
        agfamHK_CA,
        pfamRR,
        GerE,
        GerE,
        GntR,
        PKinase,
      ], ranks)
      expect(result).eql({
        domainCounts: {
          [Cache.id]: 1,
          [PAS.id]: 2,
          [pfamHisKA.id]: 1,
          [agfamHK_CA.id]: 1,
          [pfamRR.id]: 1,
          [GerE.id]: 2,
          [GntR.id]: 1,
          [PKinase.id]: 1,
        },
        inputDomains: [Cache.id, PAS.id],
        inputFunctions: [Cache.function], // Same as PAS.function
        outputDomains: [GerE.id, GntR.id, PKinase.id],
        outputFunctions: [GerE.function, PKinase.function],
        ranks,
      })
    })
  })
})
