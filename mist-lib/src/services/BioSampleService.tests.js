/* eslint-disable no-unused-expressions, no-magic-numbers */

'use strict'

const BioSampleService = require('./BioSampleService')

class MockEutils {
  fetch(url) {
    return Promise.resolve()
  }
}
const eutils = new MockEutils()

describe('BioSample Service', () => {
  let service = null

  beforeEach(() => {
    service = new BioSampleService(eutils)
  })

  describe('parseRawResult', () => {
    it('should parse the free-text correctly', () => {
      const rawBioSample = `1: Non-tumor DNA sample from Blood of a human female participant in the dbGaP study "Sequencing of Targeted Genomic Regions Associated with Smoking"
Identifiers: BioSample: SAMN03138294; SRA: SRS849435
Organism: Homo sapiens
Attributes:
    /submitter handle="NCI_CIDR_SmokingTargetedGenomicRegions"
    /biospecimen repository="NCI_CIDR_SmokingTargetedGenomicRegions"
    /study name="Sequencing of Targeted Genomic Regions Associated with Smoking"
    /study design="Case-Control"
    /biospecimen repository sample id="200543750@0124028837"
    /submitted sample id="200543750@0124028837"
    /submitted subject id="171687"
    /sex="female"
    /tissue="Blood"
    /histological type="Blood"
    /analyte type="DNA"
    /is tumor="No"
    /molecular data type="SNP Genotypes (Array)"
    /molecular data type="SNP Genotypes (NGS)"`

      const id = 'fake-id'
      const result = service.parseRawResult(id, rawBioSample)
      expect(result).eql({
        id,
        organism: 'Homo sapiens',
        description: 'Non-tumor DNA sample from Blood of a human female participant in the dbGaP study "Sequencing of Targeted Genomic Regions Associated with Smoking"',
        qualifiers: {
          submitterHandle: 'NCI_CIDR_SmokingTargetedGenomicRegions',
          biospecimenRepository: 'NCI_CIDR_SmokingTargetedGenomicRegions',
          studyName: 'Sequencing of Targeted Genomic Regions Associated with Smoking',
          studyDesign: 'Case-Control',
          biospecimenRepositorySampleId: '200543750@0124028837',
          submittedSampleId: '200543750@0124028837',
          submittedSubjectId: '171687',
          sex: 'female',
          tissue: 'Blood',
          histologicalType: 'Blood',
          analyteType: 'DNA',
          isTumor: 'No',
          molecularDataType: 'SNP Genotypes (NGS)'
        },
      })
    })
  })
})
