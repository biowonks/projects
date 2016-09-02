/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Local
const models = require('./index').withDummyConnection(),
	AseqModelFn = require('./Aseq.model.js'),
	Seq = require('../bio/Seq')

// Other
const Aseq = models.Aseq

describe('models', function() {
	describe('Aseq', function() {
		describe('kToolIdFieldNames (static property)', function() {
			it('returns a list of supported tool ids', function() {
				expect(AseqModelFn.kToolIdFieldNames).members(['pfam30', 'segs', 'coils'])
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
				expect(Aseq.toolIdFieldNames()).members(['pfam30', 'segs', 'coils'])
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
