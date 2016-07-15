/* eslint-disable no-mixed-requires, no-unused-expressions */

'use strict'

// Local
const models = require('./index').withDummyConnection(),
	AseqModelFn = require('./Aseq.model.js'),
	Seq = require('../pipeline/lib/bio/Seq')

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
	})
})
