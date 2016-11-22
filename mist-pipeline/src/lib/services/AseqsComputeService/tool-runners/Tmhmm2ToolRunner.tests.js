/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Local
const MistBootService = require('mist-lib/services/MistBootService'),
	Tmhmm2ToolRunner = require('./Tmhmm2ToolRunner'),
	testData = require('./test-data')

describe('services', function() {
	describe('AseqsService', function() {
		describe('Tmhmm2ToolRunner', function() {
			let Aseq = null
			before(() => {
				let bootService = new MistBootService()
				Aseq = bootService.setupModels().Aseq
			})

			it('computes and updates aseqs tmhmm2 field', function() {
				let x = new Tmhmm2ToolRunner(),
					aseqs = [
						Aseq.build(testData[0].coreData),
						Aseq.build(testData[1].coreData)
					]
				expect(aseqs[0].tmhmm2).not.ok
				expect(aseqs[1].tmhmm2).not.ok

				return x.run(aseqs)
				.then((resultAseqs) => {
					expect(aseqs).equal(resultAseqs)
					expect(aseqs[0].tmhmm2).eql(testData[0].tmhmm2)
					expect(aseqs[1].tmhmm2).eql(testData[1].tmhmm2)
				})
			})
		})
	})
})
