/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Local
const models = require('../../../models').withDummyConnection(),
	segsToolRunner = require('./segs.tool-runner'),
	testData = require('./test-data')

// Other
const Aseq = models.Aseq

describe('services', function() {
	describe('AseqsService', function() {
		describe('segs (tool runner)', function() {
			it('empty array resolves to empty result array', function() {
				return segsToolRunner([])
				.then((result) => {
					expect(result).deep.equal([])
				})
			})

			it('computes and updates aseqs segs', function() {
				let aseqs = [
					Aseq.build(testData[0].coreData),
					Aseq.build(testData[1].coreData)
				]
				expect(aseqs[0].segs).not.ok
				expect(aseqs[1].segs).not.ok

				return segsToolRunner(aseqs)
				.then((resultAseqs) => {
					expect(aseqs === resultAseqs)
					expect(aseqs[0].segs).eql(testData[0].segs)
					expect(aseqs[1].segs).eql(testData[1].segs)
				})
			})
		})
	})
})
