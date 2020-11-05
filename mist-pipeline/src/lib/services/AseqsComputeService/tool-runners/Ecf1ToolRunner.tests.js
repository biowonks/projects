/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */
'use strict'

// Core
const path = require('path')

// Local
const MistBootService = require('mist-lib/services/MistBootService')
const Ecf1ToolRunner = require('./Ecf1ToolRunner')
const testData = require('./test-data')

describe('services', function() {
	describe('AseqsService', function() {
		describe('Ecf1ToolRunner', function() {
			it('computes and updates aseqs ecf1 field', function() {
        const bootService = new MistBootService()
        const Aseq = bootService.setupModels().Aseq
        const ecfConfig = {
          databasePath: path.resolve(__dirname, '..', '..', '..', 'streams', 'test-data', 'hmmer2-ecfs.hmm'),
          z: 45,
        }
				const x = new Ecf1ToolRunner(ecfConfig)
				const aseqs = [
						Aseq.build(testData[3].coreData)
					]
				expect(aseqs[0].ecf1).not.ok

				return x.run(aseqs)
				.then((resultAseqs) => {
					expect(aseqs).equal(resultAseqs)
					expect(aseqs[0].ecf1).eql(testData[3].ecf1)
				})
			})
		})
	})
})
