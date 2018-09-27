/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */
'use strict'

// Local
const MistBootService = require('mist-lib/services/MistBootService')
const CoilsToolRunner = require('./CoilsToolRunner')
const testData = require('./test-data')

describe('CoilsToolRunner', function() {
	let Aseq = null
	before(() => {
		const bootService = new MistBootService()
		Aseq = bootService.setupModels().Aseq
	})

	it('computes and updates aseqs coils field', function() {
		const x = new CoilsToolRunner()
		const aseqs = [
			Aseq.build(testData[0].coreData),
			Aseq.build(testData[1].coreData)
		]
		expect(aseqs[0].coils).not.ok
		expect(aseqs[1].coils).not.ok

		return x.run(aseqs)
		.then((resultAseqs) => {
			expect(aseqs).equal(resultAseqs)
			expect(aseqs[0].coils).eql(testData[0].coils)
			expect(aseqs[1].coils).eql(testData[1].coils)
		})
	})
})
