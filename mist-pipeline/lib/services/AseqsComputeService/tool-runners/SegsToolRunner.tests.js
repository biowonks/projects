/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Local
const models = require('../../../../mist-lib/models').withDummyConnection(),
	SegsToolRunner = require('./SegsToolRunner'),
	testData = require('./test-data')

// Other
const Aseq = models.Aseq

describe('services', function() {
	describe('AseqsService', function() {
		describe('SegsToolRunner', function() {
			it('computes and updates aseqs segs field', function() {
				let x = new SegsToolRunner(),
					aseqs = [
						Aseq.build(testData[0].coreData),
						Aseq.build(testData[1].coreData)
					]
				expect(aseqs[0].segs).not.ok
				expect(aseqs[1].segs).not.ok

				return x.run(aseqs)
				.then((resultAseqs) => {
					expect(aseqs).equal(resultAseqs)
					expect(aseqs[0].segs).eql(testData[0].segs)
					expect(aseqs[1].segs).eql(testData[1].segs)
				})
			})
		})
	})
})
