/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Vendor
const BootService = require('core-lib/services/BootService'),
	Seq = require('core-lib/bio/Seq')

// Local
const loadModels = require('./index'),
	AseqModelFn = require('./Aseq.model')

describe('models', function() {
	describe('Aseq', function() {
		let models = null,
			Aseq = null
		before(() => {
			let bootService = new BootService({
					name: 'dummy-database'
				}),
				sequelize = bootService.setupSequelize()

			models = loadModels(sequelize)
			Aseq = models.Aseq
		})

		describe('kToolIdFieldNames (static property)', function() {
			it('returns a list of supported tool ids', function() {
				expect(AseqModelFn.kToolIdFieldNames).members(['pfam30', 'agfam2', 'segs', 'coils', 'tmhmm2'])
			})
		})

		describe('validate', function() {
			it('should return null if invalid aseqId', function() {
				const invalidAseqId = 'luke'
				expect(Aseq.isValidId(invalidAseqId)).false
			})
			it('empty should return null as invalid aseqId', function() {
				const invalidAseqId = ''
				expect(Aseq.isValidId(invalidAseqId)).false
			})
			it('valid AseqId should not return null', function() {
				const invalidAseqId = 'eALFsiVPvD8jtNe_9Qifig'
				expect(Aseq.isValidId(invalidAseqId)).true
			})
		})

		describe('fromSeq', function() {
			it('creates an Aseq instance from seq', function() {
				let seq = new Seq('MLTY'),
					x = Aseq.fromSeq(seq)

				expect(x instanceof Aseq.sequelize.Instance).true
				expect(x.id).equal(seq.seqId())
				expect(x.sequence).equal(seq.normalizedSequence())
				expect(x.length).equal(seq.length())
			})
		})

		describe('toolIdFieldNames', function() {
			it('returns a list of supported tool ids', function() {
				expect(Aseq.toolIdFieldNames()).members(['pfam30', 'agfam2', 'segs', 'coils', 'tmhmm2'])
			})
		})

		it('pfam30 getter / setter', function() {
			let seq = new Seq('MTNVLIVEDEQAIRRFLRTALEGDGMRVFEAETLQRGLLEAATRKPDLIILDLGLPDGDGIEFIRDLRQWSAVPVIVLSARSEESDKIAALDAGADDYLSKPFGIGELQARLRVALRRHSATTAPDPLVKFSDVTVDLAARVIHRGEEEVHLTPIEFRLLAVLLNNAGKVLTQRQLLNQVWGPNAVEHSHYLRIYMGHLRQKLEQDPARPRHFITETGIGYRFML'),
				x = Aseq.fromSeq(seq)

			expect(x.pfam30).not.ok
			let newDomains = [
				{
					name: 'Response_reg',
					score: 101.9,
					bias: 0,
					c_evalue: 2.5e-33,
					i_evalue: 2e-29,
					hmm_from: 1,
					hmm_to: 111,
					hmm_cov: '[.',
					ali_from: 4,
					ali_to: 112,
					ali_cov: '..',
					env_from: 4,
					env_to: 113,
					env_cov: '..',
					acc: 0.98
				},
				{
					name: 'Trans_reg_C',
					score: 77.2,
					bias: 0,
					c_evalue: 8.2e-26,
					i_evalue: 6.7e-22,
					hmm_from: 2,
					hmm_to: 77,
					hmm_cov: '.]',
					ali_from: 148,
					ali_to: 223,
					ali_cov: '..',
					env_from: 146,
					env_to: 223,
					env_cov: '..',
					acc: 0.98
				}
			]

			x.pfam30 = newDomains
			expect(x.getDataValue('pfam30')).eql([
				[
					'Response_reg',
					101.9,
					0,
					2.5e-33,
					2e-29,
					1,
					111,
					'[.',
					4,
					112,
					'..',
					4,
					113,
					'..',
					0.98
				],
				[
					'Trans_reg_C',
					77.2,
					0,
					8.2e-26,
					6.7e-22,
					2,
					77,
					'.]',
					148,
					223,
					'..',
					146,
					223,
					'..',
					0.98
				]
			])

			expect(x.pfam30).eql(newDomains)
		})
	})
})
