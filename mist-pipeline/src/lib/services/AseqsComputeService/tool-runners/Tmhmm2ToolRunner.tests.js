/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Local
const MistBootService = require('mist-lib/services/MistBootService')
const Tmhmm2ToolRunner = require('./Tmhmm2ToolRunner')
const testData = require('./test-data')

describe.skip('Tmhmm2ToolRunner', function() {
	let Aseq = null
	before(() => {
		const bootService = new MistBootService()
		Aseq = bootService.setupModels().Aseq
	})

	it('computes and updates aseqs tmhmm2 field', function() {
		const x = new Tmhmm2ToolRunner()
		const aseqs = [
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
