/* eslint-disable no-magic-numbers,space-infix-ops,camelcase,no-unused-expressions */
'use strict'

// Core
const path = require('path')

// Local
const Domain = require('core-lib/bio/Domain')
const {
  AGFAM_TOOL_ID,
  ECF_TOOL_ID,
  MAX_HYBRID_RECEIVER_START,
  MAX_HISKA_CA_SEPARATION,
  MAX_HK_CA_SEPARATION,
  PFAM_TOOL_ID,
  PrimaryRank,
  SecondaryRank,
  pfamHKNonSignalDomains,
} = require('mist-lib/services/stp.constants')
const StpService = require('./StpService')

/**
 * The following test che hmm database comes from release v3.0 of the chemotaxis-models
 * https://github.com/biowonks/chemotaxis-models and contains the following models:
 *
 * chea-ACF
 * chea-F1
 * chea-F2
 * chea-Uncat
 * cheb-ACF
 * cheb-F1
 * cheb-F2
 * cheb-Uncat
 * chec-F1
 * chec-PAS
 * ched-F1
 * ched-Uncat
 * cher-ACF
 * cher-F1
 * cher-F2
 * cher-Uncat
 * chev-F1
 * chev-F3
 * chev-Uncat
 * chez-F3
 * chez-F4
 * mcp-64H
 * mcp-44H
 * mcp-36H
 */
const TEST_CHE_DATABASE_PATH = path.resolve(__dirname, 'test-data', 'test-che.hmm')

const DUMMY_FASTA = '>test\nMPDHLDSSENLSIYKTIFQTSLDAMLLSMPDGSILAANHTAEEMFGMSQGEIIAVGRDGLLIQDESFQAAIKERAQKGRIKAELIFKRKNGSLFKGELTSTF'

describe('StpService', () => {
  describe('analyze', () => {
    let stpSpec = null
    beforeEach(() => {
      stpSpec = [
        {
          source: null,
          function: null,
          id: null,
          kind: null,
          specific: false,
          name: null,
        },
      ]
    })

    it('should return null for empty predictions', () => {
      const service = new StpService(stpSpec, TEST_CHE_DATABASE_PATH)
      return service.analyze([{}])
      .then((result) => expect(result).eql([null]))
    })

    describe('non signaling HK should return null', () => {
      const hkSpec = [
        {source: 'pfam', id: 'HK_CA', name: 'HATPase_c', specific: true},
        {source: 'pfam', id: 'HisKA', name: 'HisKA', specific: true},
        {source: 'agfam', id: 'HK_CA', name: 'HK_CA', specific: true},
      ]

      const service = new StpService(hkSpec, TEST_CHE_DATABASE_PATH)
      for (let row of hkSpec) {
        for (let hkNonSignalDomain of pfamHKNonSignalDomains) {
          it(`${row.source}:${row.id} domain with ${hkNonSignalDomain} should return null`, () => {
            const aseq = {
              [PFAM_TOOL_ID]: [
                new Domain(1, 100, 100, 1e-10, row.name).toHmmer3(),
                new Domain(101, 200, 100, 1e-10, hkNonSignalDomain).toHmmer3(),
              ],
              toFasta: () => DUMMY_FASTA,
            }
            return service.analyze([aseq])
            .then((result) => expect(result).eql([null]))
          })
        }
      }
    })

    describe('chemotaxis', () => {
      const spec = [
        {source: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', specific: true},
        {source: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', specific: true},
        {source: 'pfam', id: 'HPt', kind: 'transmitter', name: 'HPt', specific: true},
        {source: 'pfam', id: 'CheW', kind: 'chemotaxis', name: 'CheW', specific: true},
        {source: 'pfam', id: 'CheB_methylest', kind: 'chemotaxis', name: 'CheB_methylest', specific: true},
        {source: 'pfam', id: 'CheR', kind: 'chemotaxis', name: 'CheR', specific: true},
        {source: 'pfam', id: 'CheW', kind: 'chemotaxis', name: 'CheW', specific: true},
        {source: 'pfam', id: 'CheR_N', kind: 'chemotaxis', name: 'CheR_N', specific: true},
        {source: 'pfam', id: 'CheD', kind: 'chemotaxis', name: 'CheD', specific: true},
        {source: 'pfam', id: 'CheZ', kind: 'chemotaxis', name: 'CheZ', specific: true},
        {source: 'pfam', id: 'CheC', kind: 'chemotaxis', name: 'CheC', specific: true},
        {source: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', specific: true},
        {source: 'pfam', id: 'MCPsignal', kind: 'chemotaxis', name: 'MCPsignal', specific: true},
        {source: 'agfam', id: 'HK_CA:Che', kind: 'chemotaxis', name: 'HK_CA:Che', specific: true},
      ]
      const service = new StpService(spec, TEST_CHE_DATABASE_PATH)

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

      describe('secondary rank prediction', () => {
        testSets.forEach((testSet) => {
          it(`should have a ${testSet.secondaryRank} for ${testSet.domains.join(', ')}`, () => {
            const domains = testSet.domains.map((name, i) => new Domain(i*100 + 1, i*100 + 100, 100, 1e-10, name).toHmmer3())
            const aseq = {
              [PFAM_TOOL_ID]: domains,
              toFasta: () => DUMMY_FASTA,
            }
            return service.analyze([aseq])
            .then((result) => {
              expect(result[0].ranks).eql([PrimaryRank.chemotaxis, testSet.secondaryRank])
            })
          })
        })

        it('should have a chea secondary rank when it has CheW or HK_CA:Che', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'CheW').toHmmer3(),
            ],
            [AGFAM_TOOL_ID]: [
              new Domain(101, 200, 100, 1e-10, 'HK_CA:Che').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.chemotaxis, SecondaryRank.chea]))
        })
      })

      describe('chemotaxis classification', () => {
        it('CheA ACF', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'CheW').toHmmer3(),
              new Domain(101, 200, 100, 1e-10, 'HPt').toHmmer3(),
            ],
            toFasta: () => '>GCF_000010725.1-AZL_RS17035\nMNIRQRLLAAFDLEHKEHLSAIRNALREAEATGAAPDLADIHRRAHSLKGAARAVDLPEVEAISHRLEAAFIAVQKGEVPVDAATIGVVRRALDAIEDLVAWSLQGGDAVEVAGTLADLDALAAGHDRGPAPARPIGRPPPSPSRRERGIDPDSAALVRIAAQGLERLSETASALLPEVEAQAGLGDQLRLLRQDWRALDRAWRHLRVQLGRGALGRRGGEQGADRLDDRGALPALMAFERRFRALGGALDAAHRGHDRLLWSMRRWGGGLQQDMRRLRMLPAENQLSGLGRMVRDISRAEGKEVEVDVRGLEVEADRAVLQRLKDPILHIARNAISHGIETPAERLALGKRPAARVTIAASVEGARLRLRIEDDGRGLDRAAILRKAAERGLIDAADLPSGGLSAGEDIPLERLTEFLFHPGFSTASHTTELAGRGMGLAIARREVERLQGSLTVTDRPGGGTAVTIEVPLSLLSQRLVFVAVQDQILAIPSADVSQLRTVTAGALFCGIGAPMIRIGEEEVPVTSLAALLGMEAPVVPAADRSLALAVIRAGDRRLALAVDRFVATREAVVTAAAETGLDPGRYLGTVLMDDGGPALVLNIPGLTPPTGSVLPAPVRAAEDAPPDRAHILVVDDSITTRTLEKSILEAHGYRVTLCVDGREALERLSEGMEVELIISDVEMPRMDGFALLQAVKADRRLAEIPVVLVTSRASDEDRERGLRLGADAYIVKTRFDQNELLAGIRRLL\n',
          }
          return service.analyze([aseq])
          .then((result) => {
            expect(result[0].ranks).eql([PrimaryRank.chemotaxis, SecondaryRank.chea, 'ACF'])
            expect(result[0].cheHits.length).equal(4)
            const cheNames = result[0].cheHits.map((x) => x.name)
            expect(cheNames).eql([
              'chea-ACF',
              'chea-F1',
              'chea-Uncat',
              'chea-F2',
            ])
          })
        })

        it('batch containing mcp and cheb ', () => {
          // E coli Tsr
          const mcp = {
            [PFAM_TOOL_ID]: [
              new Domain(183, 365, 114.8, 3.3e-33, 'MCPsignal').toHmmer3(),
            ],
            toFasta: () => '>GCF_000005845.2-b4355\nMLKRIKIVTSLLLVLAVFGLLQLTSGGLFFNALKNDKENFTVLQTIRQQQSTLNGSWVALLQTRNTLNRAGIRYMMDQNNIGSGSTVAELMESASISLKQAEKNWADYEALPRDPRQSTAAAAEIKRNYDIYHNALAELIQLLGAGKINEFFDQPTQGYQDGFEKQYVAYMEQNDRLHDIAVSDNNASYSQAMWILVGVMIVVLAVIFAVWFGIKASLVAPMNRLIDSIRHIAGGDLVKPIEVDGSNEMGQLAESLRHMQGELMRTVGDVRNGANAIYSGASEIATGNNDLSSRTEQQAASLEETAASMEQLTATVKQNAENARQASHLALSASETAQRGGKVVDNVVQTMRDISTSSQKIADIISVIDGIAFQTNILALNAAVEAARAGEQGRGFAVVAGEVRNLAQRSAQAAREIKSLIEDSVGKVDVGSTLVESAGETMAEIVSAVTRVTDIMGEIASASDEQSRGIDQVGLAVAEMDRVTQQNAALVEESAAAAAALEEQASRLTEAVAVFRIQQQQRETSAVVKTVTPAAPRKMAVADSEENWETF\n',
          }
          const cheb = {
            [PFAM_TOOL_ID]: [
              new Domain(6, 111, 87.4, 6.2e-25, 'Response_reg').toHmmer3(),
              new Domain(181, 360, 204.5, 8.5e-61, 'CheB_methylest').toHmmer3(),
            ],
            toFasta: () => '>GCF_000376965.1-F555_RS0103785\nMRKISVLVADDSAFMRKVLSDILNSDEDIEVIGTAKDGIEAVELVQKLSPNVVTMDVEMPRMDGLEAVKKIMEIKPTPILMVSALTRKGSEATFKALEYGAVDFIEKPSGSISLDIRKIGNEIINKVKSVSKAVVRKKQHIAREPTTEKVEKLGDKKTLPVESEFVGELNIPPEKLKKMAVMIGSSTGGPPVVSEIIAMLPKDMPPIFVVQHMPQGFTKMFAERMNDRSKLNVKEAQDGELVKPGHVYVAPGDYQMILKKRGDDVYIELDNHMPKVHGTRPTVDITAEHVAKIYGKNTVGVILTGIGRDGAYGMKQIRDRGGHTIAQKEETCVVFGMPKAAIEMGAIELVLPPSKIPENIVKFIKLIGG\n',
          }

          return service.analyze([mcp, cheb])
          .then(([mcpResult, cheBResult]) => {
            expect(mcpResult.ranks).eql([PrimaryRank.chemotaxis, SecondaryRank.mcp, '36H'])
            const mcpNames = mcpResult.cheHits.map((x) => x.name)
            expect(mcpNames).eql([
              'mcp-36H',
              'mcp-44H',
              'mcp-64H',
              'mcp-44H',
              'mcp-44H',
            ])

            expect(cheBResult.ranks).eql([PrimaryRank.chemotaxis, SecondaryRank.cheb, 'F1'])
            const chebNames = cheBResult.cheHits.map((x) => x.name)
            expect(chebNames).eql([
              'cheb-F1',
              'cheb-ACF',
              'cheb-F2',
              'cheb-Uncat',
            ])
          })
        })
      })
    })

    describe('two-component systems', () => {
      const spec = [
        {source: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', specific: true},
        {source: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', specific: true},
        {source: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', specific: true},
        {source: 'pfam', id: 'HPT', kind: 'transmitter', name: 'HPT', specific: true},
        {source: 'agfam', id: 'HK_CA', kind: 'transmitter', name: 'HK_CA', specific: true},
        {source: 'agfam', id: 'RR', kind: 'receiver', name: 'RR', specific: true},
      ]
      const service = new StpService(spec, TEST_CHE_DATABASE_PATH)

      describe('hybrid (receiver + histidine kinase)', () => {
        it(`should return ${PrimaryRank.tcp} + ${SecondaryRank.hrr} if first receiver is N-terminal to first histidine kinase and this receiver is within ${MAX_HYBRID_RECEIVER_START} aa of the N-terimnus`, () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(MAX_HYBRID_RECEIVER_START, MAX_HYBRID_RECEIVER_START + 100, 100, 1e-10, 'Response_reg').toHmmer3(),
              new Domain(MAX_HYBRID_RECEIVER_START + 120, MAX_HYBRID_RECEIVER_START + 120 + 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.hrr]))
        })

        it(`should return ${PrimaryRank.tcp} + ${SecondaryRank.other} if first receiver is N-terminal to first histidine kinase and this receiver is greater than ${MAX_HYBRID_RECEIVER_START} aa away from the N-terminus`, () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(MAX_HYBRID_RECEIVER_START+1, MAX_HYBRID_RECEIVER_START + 100, 100, 1e-10, 'Response_reg').toHmmer3(),
              new Domain(MAX_HYBRID_RECEIVER_START + 120, MAX_HYBRID_RECEIVER_START + 120 + 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.other]))
        })

        it(`should return ${PrimaryRank.tcp} + ${SecondaryRank.hhk} if first receiver occurs after a histidine kinase`, () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
              new Domain(120, 120 + 100, 100, 1e-10, 'Response_reg').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.hhk]))
        })
      })

      describe(`${PrimaryRank.tcp} + ${SecondaryRank.hk}`, () => {
        it('if has pfam HATPase domain', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HATPase_c').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.hk]))
        })

        it('if has pfam HisKA domain', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HisKA').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.hk]))
        })

        it('if has agfam HK_CA domain', () => {
          const aseq = {
            [AGFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HK_CA').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.hk]))
        })
      })

      describe(`${PrimaryRank.tcp} + ${SecondaryRank.rr}`, () => {
        it('if has pfam Response_reg domain', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'Response_reg').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.rr]))
        })

        it('if has agfam RR domain', () => {
          const aseq = {
            [AGFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'RR').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.rr]))
        })
      })

      describe(`${PrimaryRank.tcp} + ${SecondaryRank.other}`, () => {
        it('if has transmitter domain, but no hatpase or receiver domains', () => {
          const aseq = {
            [PFAM_TOOL_ID]: [
              new Domain(1, 100, 100, 1e-10, 'HPT').toHmmer3(),
            ],
            toFasta: () => DUMMY_FASTA,
          }
          return service.analyze([aseq])
          .then((result) => expect(result[0].ranks).eql([PrimaryRank.tcp, SecondaryRank.other]))
        })
      })
    })

    describe('ECF ranks', () => {
      const spec = [
        {source: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_1', specific: true},
        {source: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_999', specific: false},
        {source: 'pfam', id: 'ECF', kind: 'ecf', name: 'Sigma70_ECF', specific: true},
        {source: 'pfam', id: 'ECF', kind: 'ecf', name: 'SomeECF', specific: false},
      ]
      const service = new StpService(spec, TEST_CHE_DATABASE_PATH)

      it(`should return ${PrimaryRank.ecf} if has ECF specific and pfam Sigma70_r2 domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'Sigma70_r2').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ecf]))
      })

      it(`should return ${PrimaryRank.ecf} if has ECF specific and pfam Sigma70_r4 domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'Sigma70_r4').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ecf]))
      })

      it(`should return ${PrimaryRank.ecf} if has ECF specific and pfam Sigma70_r4_2 domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'Sigma70_r4_2').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ecf]))
      })

      it(`should return ${PrimaryRank.ecf} if has ECF specific and pfam ECF domain`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          [PFAM_TOOL_ID]: [
            new Domain(101, 200, 100, 1e-10, 'SomeECF').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ecf]))
      })

      it(`should return ${PrimaryRank.ecf} if has pfam ECF specific`, () => {
        const aseq = {
          [PFAM_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'Sigma70_ECF').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ecf]))
      })

      it(`should return ${PrimaryRank.other} if has ECF specific by itself`, () => {
        const aseq = {
          [ECF_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'ECF_1').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ecf]))
      })
    })

    describe('one-component systems', () => {
      const spec = [
        {source: 'pfam', id: 'HTH_1', kind: 'output', name: 'HTH_1', specific: true},
        {source: 'agfam', id: 'DNA-binder', kind: 'output', name: 'SomeHTH', specific: true},
      ]
      const service = new StpService(spec, TEST_CHE_DATABASE_PATH)

      it(`should return ${PrimaryRank.ocp} if has pfam output`, () => {
        const aseq = {
          [PFAM_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'HTH_1').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ocp]))
      })

      it(`should return ${PrimaryRank.ocp} if has agfam output`, () => {
        const aseq = {
          [AGFAM_TOOL_ID]: [
            new Domain(1, 100, 100, 1e-10, 'SomeHTH').toHmmer3(),
          ],
          toFasta: () => DUMMY_FASTA,
        }
        return service.analyze([aseq])
        .then((result) => expect(result[0].ranks).eql([PrimaryRank.ocp]))
      })
    })
  })

  describe('analyzeAgfamDomains_', () => {
    const spec = [
      {source: 'agfam', id: 'HK_CA', kind: 'transmitter', name: 'HK_CA', specific: true},
      {source: 'agfam', id: 'HK_CA:Che', kind: 'transmitter', name: 'HK_CA:Che', specific: true},
      {source: 'agfam', id: 'RR', kind: 'receiver', name: 'RR', specific: true},
      {source: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', specific: true},
      {source: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', specific: true},
      {source: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', specific: true},
      {source: 'pfam', id: 'HPT', kind: 'transmitter', name: 'HPT', specific: true},
    ]
    const service = new StpService(spec, TEST_CHE_DATABASE_PATH)

    it('should remove equivalent pfam signaling domains that overlap with the agfam signal domains', () => {
      const nonSignalingAgfamDomain = new Domain(101, 200, 100, 1e-10, 'unknown')
      const agfamDomains = [
        new Domain(1, 100, 100, 1e-10, 'HK_CA'),
        nonSignalingAgfamDomain,
      ]
      const pfamDomains = [
        new Domain(50, 150, 100, 1e-10, 'HATPase_c'),
      ]

      const result = service.analyzeAgfamDomains_(agfamDomains, pfamDomains)
      expect(result).eql([spec[0]])
      expect(agfamDomains.length).equal(2)
      expect(pfamDomains).empty
    })

    it(`with signal domain HK_CA should remove upstream pfam HisKA domains within ${MAX_HISKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HISKA_CA_SEPARATION, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains)
      expect(pfamDomains).empty
    })

    it(`with signal domain HK_CA should not remove upstream pfam HisKA domains greater than ${MAX_HISKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HISKA_CA_SEPARATION - 1, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains)
      expect(pfamDomains.length).equal(1)
    })

    it('with signal domain HK_CA should not remove downstream pfam HisKA domains', () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA'),
      ]
      const pfamDomains = [
        new Domain(201, 250, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains)
      expect(pfamDomains.length).equal(1)
    })

    it(`with signal domain HK_CA:Che should remove upstream pfam HisKA domains within ${MAX_HISKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA:Che'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HISKA_CA_SEPARATION, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains)
      expect(pfamDomains).empty
    })

    it(`with signal domain HK_CA:Che should not remove upstream pfam HisKA domains greater than ${MAX_HISKA_CA_SEPARATION} aa`, () => {
      const agfamDomains = [
        new Domain(100, 200, 100, 1e-10, 'HK_CA:Che'),
      ]
      const pfamDomains = [
        new Domain(1, 100 - MAX_HISKA_CA_SEPARATION - 1, 100, 1e-10, 'HisKA'),
      ]

      service.analyzeAgfamDomains_(agfamDomains, pfamDomains)
      expect(pfamDomains.length).equal(1)
    })
  })

  describe('analyzePfamDomains_', () => {
    const spec = [
      {source: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', specific: true},
      {source: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', specific: true},
      {source: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', specific: true},
      {source: 'pfam', id: 'GntR', kind: 'output', name: 'GntR', specific: true},
    ]
    const service = new StpService(spec, TEST_CHE_DATABASE_PATH)

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
    const ECF_1 = {source: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_1', specific: true, function: 'ECF'}
    const ECF_2 = {source: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_2', specific: true, function: 'ECF'}
    const service = new StpService([ECF_1, ECF_2], TEST_CHE_DATABASE_PATH)

    it('should return the non-overlapping ECF signaling domains', () => {
      const a = new Domain(1, 100, 100, 1e-5, 'ECF_1')
      const b = new Domain(1, 100, 100, 1e-10, 'ECF_2')
      const ecfDomains = [a, b]
      const result = service.analyzeEcfDomains_(ecfDomains)
      expect(result).eql([ECF_2])
    })
  })

  describe('summarize_', () => {
    const agfamHK_CA = {source: 'agfam', id: 'HK_CA', kind: 'transmitter', name: 'HK_CA', specific: true, function: 'Transmitter'}
    const pfamRR = {source: 'pfam', id: 'RR', kind: 'receiver', name: 'Response_reg', specific: true, function: 'Receiver'}
    const pfamHK_CA = {source: 'pfam', id: 'HK_CA', kind: 'transmitter', name: 'HATPase_c', specific: true, function: 'Transmitter'}
    const pfamHisKA = {source: 'pfam', id: 'HisKA', kind: 'transmitter', name: 'HisKA', specific: true, function: 'Transmitter'}
    const Cache = {source: 'pfam', id: 'Cache', kind: 'input', name: 'Cache', specific: false, function: 'Small molecule binding'}
    const PAS = {source: 'pfam', id: 'PAS', kind: 'input', name: 'PAS', specific: false, function: 'Small molecule binding'}
    const Citrate_synt = {source: 'pfam', id: 'Citrate_synt', kind: 'input', name: 'Citrate_synt', specific: false, function: 'Enzymatic'}
    const GntR = {source: 'pfam', id: 'GntR', kind: 'output', name: 'GntR', specific: true, function: 'DNA-binding'}
    const GerE = {source: 'pfam', id: 'GerR', kind: 'output', name: 'GerR', specific: true, function: 'DNA-binding'}
    const PKinase = {source: 'pfam', id: 'PKinase', kind: 'output', name: 'PKinase', specific: true, function: 'Protein kinase'}
    const ECF_1 = {source: 'ecf', id: 'ECF', kind: 'ecf', name: 'ECF_1', specific: true, function: 'ECF'}
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
    ]
    const service = new StpService(spec, TEST_CHE_DATABASE_PATH)

    it('agfam HK_CA plus pfam HK_CA should count as 2 doamin counts', () => {
      const ranks = []
      const result = service.summarize_([
        agfamHK_CA,
        agfamHK_CA,
        pfamHK_CA,
      ], ranks)
      expect(result.counts).eql({
        [agfamHK_CA.id]: 3,
      })
    })

    it('multiple distinct domain counts', () => {
      const ranks = []
      const result = service.summarize_([Cache, PAS, ECF_1], ranks)
      expect(result.counts).eql({
        [Cache.id]: 1,
        [PAS.id]: 1,
        [ECF_1.id]: 1,
      })
    })

    it('should only include distinct sets of input domains and input functions', () => {
      const ranks = []
      const result = service.summarize_([Cache, Cache, PAS, PAS, Citrate_synt, GerE], ranks)
      expect(result.inputs).members([Cache.id, PAS.id, Citrate_synt.id])
      expect(result.inputFunctions).members([Cache.function, PAS.function, Citrate_synt.function])
    })

    it('should only include distinct sets of output domains and output functions', () => {
      const ranks = []
      const result = service.summarize_([Cache, GerE, GerE, PKinase], ranks)
      expect(result.outputs).members([GerE.id, PKinase.id])
      expect(result.outputFunctions).members([GerE.function, PKinase.function])
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
        counts: {
          [pfamRR.id]: 1,
        },
        inputs: [],
        inputFunctions: [],
        outputs: [],
        outputFunctions: [],
        ranks,
      })
    })

    it('should not include transmitter functions in the input or output domains and functions', () => {
      const ranks = []
      const result = service.summarize_([agfamHK_CA], ranks)
      expect(result).eql({
        counts: {
          [agfamHK_CA.id]: 1,
        },
        inputs: [],
        inputFunctions: [],
        outputs: [],
        outputFunctions: [],
        ranks,
      })
    })

    it('should not include ecf functions in the input or output domains and functions', () => {
      const ranks = []
      const result = service.summarize_([ECF_1], ranks)
      expect(result).eql({
        counts: {
          [ECF_1.id]: 1,
        },
        inputs: [],
        inputFunctions: [],
        outputs: [],
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
        counts: {
          [Cache.id]: 1,
          [PAS.id]: 2,
          [pfamHisKA.id]: 1,
          [agfamHK_CA.id]: 1,
          [pfamRR.id]: 1,
          [GerE.id]: 2,
          [GntR.id]: 1,
          [PKinase.id]: 1,
        },
        inputs: [Cache.id, PAS.id],
        inputFunctions: [Cache.function], // Same as PAS.function
        outputs: [GerE.id, GntR.id, PKinase.id],
        outputFunctions: [GerE.function, PKinase.function],
        ranks,
      })
    })
  })
})
