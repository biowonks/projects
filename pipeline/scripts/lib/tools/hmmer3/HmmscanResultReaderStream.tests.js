'use strict'

// Core node libraries
let path = require('path'),
	fs = require('fs')

// Local includes
let HmmscanResultReaderStream = require('./HmmscanResultReaderStream')

describe('HmmscanResultReaderStream', function() {
	it('streaming prediction of hmmscan', function(done) {
		let inputFile = path.resolve(__dirname, 'HmmscanResultReaderStream.test.hmmscanResults.txt'),
			inStream = fs.createReadStream(inputFile),
			hmmscanResultReaderStream = new HmmscanResultReaderStream(),
			results = []

		inStream.pipe(hmmscanResultReaderStream)
			.on('data', (result) => {
				results.push(result)
			})
			.on('finish', () => {
				expect(results).deep.equal([
					{
						domains: [
							{
								name: 'ETF',
								score: 81.9,
								bias: 0,
								c_Evalue: 2.8e-27,
								i_Evalue: 4.6e-23,
								hmmfrom: 80,
								hmm_to: 180,
								hmmCov: '..',
								alifrom: 2,
								ali_to: 108,
								aliCov: '..',
								envfrom: 1,
								env_to: 110,
								envCov: '[.',
								acc: 0.95
							}
						],
						seqName: 'demoSeqA',
						seqLength: '151'
					},
					{
						domains: [
							{
								name: 'ETF',
								score: 145.5,
								bias: 0.1,
								c_Evalue: 1.7e-46,
								i_Evalue: 1.4e-42,
								hmmfrom: 6,
								hmm_to: 180,
								hmmCov: '..',
								alifrom: 28,
								ali_to: 204,
								aliCov: '..',
								envfrom: 24,
								env_to: 206,
								envCov: '..',
								acc: 0.94
							},
							{
								name: 'ETF',
								score: 145.5,
								bias: 0.1,
								c_Evalue: 1.7e-46,
								i_Evalue: 1.4e-42,
								hmmfrom: 6,
								hmm_to: 180,
								hmmCov: '..',
								alifrom: 275,
								ali_to: 451,
								aliCov: '..',
								envfrom: 271,
								env_to: 453,
								envCov: '..',
								acc: 0.94
							}
						],
						seqName: 'demoSeqB',
						seqLength: '494'
					},
					{
						domains: [
							{
								name: 'Response_reg',
								score: 101.9,
								bias: 0,
								c_Evalue: 2.5e-33,
								i_Evalue: 2e-29,
								hmmfrom: 1,
								hmm_to: 111,
								hmmCov: '[.',
								alifrom: 4,
								ali_to: 112,
								aliCov: '..',
								envfrom: 4,
								env_to: 113,
								envCov: '..',
								acc: 0.98
							},
							{
								name: 'Trans_reg_C',
								score: 77.2,
								bias: 0,
								c_Evalue: 8.2e-26,
								i_Evalue: 6.7e-22,
								hmmfrom: 2,
								hmm_to: 77,
								hmmCov: '.]',
								alifrom: 148,
								ali_to: 223,
								aliCov: '..',
								envfrom: 146,
								env_to: 223,
								envCov: '..',
								acc: 0.98
							}
						],
						seqName: 'accession:NP_415222.1|locus:b0694|genom',
						seqLength: '225'
					},
					{
						domains: [],
						seqName: 'noDomain',
						seqLength: '159'
					},
					{
						domains: [
							{
								name: 'KdpD',
								score: 325.8,
								bias: 0,
								c_Evalue: 2.6e-101,
								i_Evalue: 8.6e-98,
								hmmfrom: 1,
								hmm_to: 210,
								hmmCov: '[]',
								alifrom: 21,
								ali_to: 230,
								aliCov: '..',
								envfrom: 21,
								env_to: 230,
								envCov: '..',
								acc: 1
							},
							{
								name: 'DUF4118',
								score: 99,
								bias: 15.7,
								c_Evalue: 3.3e-32,
								i_Evalue: 1.1e-28,
								hmmfrom: 2,
								hmm_to: 106,
								hmmCov: '..',
								alifrom: 403,
								ali_to: 507,
								aliCov: '..',
								envfrom: 402,
								env_to: 508,
								envCov: '..',
								acc: 0.95
							},
							{
								name: 'HATPase_c',
								score: 80.5,
								bias: 0,
								c_Evalue: 3.4e-26,
								i_Evalue: 1.1e-22,
								hmmfrom: 4,
								hmm_to: 109,
								hmmCov: '..',
								alifrom: 776,
								ali_to: 882,
								aliCov: '..',
								envfrom: 773,
								env_to: 883,
								envCov: '..',
								acc: 0.94
							},
							{
								name: 'HisKA',
								score: 40.8,
								bias: 1.8,
								c_Evalue: 4.5e-14,
								i_Evalue: 1.5e-10,
								hmmfrom: 2,
								hmm_to: 64,
								hmmCov: '.]',
								alifrom: 664,
								ali_to: 730,
								aliCov: '..',
								envfrom: 663,
								env_to: 730,
								envCov: '..',
								acc: 0.91
							},
							{
								name: 'GAF_3',
								score: 34.4,
								bias: 0,
								c_Evalue: 6.7e-12,
								i_Evalue: 2.2e-8,
								hmmfrom: 1,
								hmm_to: 129,
								hmmCov: '[]',
								alifrom: 527,
								ali_to: 644,
								aliCov: '..',
								envfrom: 527,
								env_to: 644,
								envCov: '..',
								acc: 0.89
							}
						],
						seqName: 'b0695',
						seqLength: '894'
					},
					{
						domains: [
							{
								name: 'KdpC',
								score: 228.3,
								bias: 0,
								c_Evalue: 3.4e-72,
								i_Evalue: 5.5e-68,
								hmmfrom: 2,
								hmm_to: 182,
								hmmCov: '.]',
								alifrom: 5,
								ali_to: 187,
								aliCov: '..',
								envfrom: 4,
								env_to: 187,
								envCov: '..',
								acc: 0.98
							}
						],
						seqName: 'KdpC',
						seqLength: '190'
					},
					{
						domains: [
							{
								name: 'E1-E2_ATPase',
								score: 140.6,
								bias: 0.6,
								c_Evalue: 7.3e-45,
								i_Evalue: 3.9e-41,
								hmmfrom: 3,
								hmm_to: 221,
								hmmCov: '.]',
								alifrom: 72,
								ali_to: 296,
								aliCov: '..',
								envfrom: 70,
								env_to: 296,
								envCov: '..',
								acc: 0.94
							},
							{
								name: 'Hydrolase',
								score: 132.6,
								bias: 4.1,
								c_Evalue: 3.8e-42,
								i_Evalue: 2e-38,
								hmmfrom: 1,
								hmm_to: 210,
								hmmCov: '[]',
								alifrom: 301,
								ali_to: 530,
								aliCov: '..',
								envfrom: 301,
								env_to: 530,
								envCov: '..',
								acc: 0.9
							},
							{
								name: 'Hydrolase_3',
								score: 21.4,
								bias: 0.3,
								c_Evalue: 2.8e-8,
								i_Evalue: 0.00015,
								hmmfrom: 194,
								hmm_to: 242,
								hmmCov: '..',
								alifrom: 501,
								ali_to: 549,
								aliCov: '..',
								envfrom: 497,
								env_to: 556,
								envCov: '..',
								acc: 0.9
							}
						],
						seqName: 'NP_415225.1_Transmembrane_protein',
						seqLength: '682'
					},
					{
						domains: [
							{
								name: 'KdpA',
								score: 786.5,
								bias: 34,
								c_Evalue: 5.3e-241,
								i_Evalue: 8.6e-237,
								hmmfrom: 2,
								hmm_to: 546,
								hmmCov: '.]',
								alifrom: 11,
								ali_to: 556,
								aliCov: '..',
								envfrom: 10,
								env_to: 556,
								envCov: '..',
								acc: 0.99
							}
						],
						seqName: 'locus:b0698_potassium_translocating_ATPase,_subunit_A_[E._coli]',
						seqLength: '557'
					}
				])
			done()
		})
	})
})