/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Local
const models = require('../../../models').withDummyConnection(),
	coilsToolRunner = require('./coils.tool-runner'),
	testData = require('./test-data')

// Other
const Aseq = models.Aseq

describe('services', function() {
	describe('AseqsService', function() {
		describe('coils (tool runner)', function() {
			let aseqs = null

			beforeEach(() => {
				aseqs = [
					Aseq.build(testData[0].coreData),
					Aseq.build(testData[1].coreData)
				]
			})

			it('empty array resolves to empty result array', function() {
				return coilsToolRunner([])
				.then((result) => {
					expect(result).deep.equal([])
				})
			})

			it('computes and updates aseqs coils field (default target field)', function() {
				expect(aseqs[0].coils).not.ok
				expect(aseqs[1].coils).not.ok

				return coilsToolRunner(aseqs)
				.then((resultAseqs) => {
					expect(aseqs === resultAseqs)
					expect(aseqs[0].coils).eql(testData[0].coils)
					expect(aseqs[1].coils).eql(testData[1].coils)
				})
			})

			it('alternate target field', function() {
				expect(aseqs[0].coils).not.ok
				expect(aseqs[1].coils).not.ok

				return coilsToolRunner(aseqs, 'coilscoils')
				.then((resultAseqs) => {
					expect(aseqs === resultAseqs)
					expect(aseqs[0].coils).not.ok
					expect(aseqs[0].coilscoils).eql(testData[0].coils)
					expect(aseqs[1].coils).not.ok
					expect(aseqs[1].coilscoils).eql(testData[1].coils)
				})
			})
		})
	})
})
