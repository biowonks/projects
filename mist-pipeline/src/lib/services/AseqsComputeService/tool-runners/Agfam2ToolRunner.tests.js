/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Core
const path = require('path')

// Local
const MistBootService = require('mist-lib/services/MistBootService'),
	Agfam2ToolRunner = require('./Agfam2ToolRunner'),
	testData = require('./test-data')

// Other
/**
 * This test leverages the same test hmm database as used by the Pfam31ToolRunner. Such a database
 * does not actually reflect the Agfam HMM database (in fact it is a subset of the Pfam31 database);
 * however, this does not matter here since we are simply testing the mechanics of the tool runner.
 * The agfam database is passed in as a configuration option.
 */
const databasePath = path.resolve(__dirname, '..', '..', '..', 'streams', 'test-data', 'test.hmm'),
	numHmms = 16295

describe('services', function() {
	describe('AseqsService', function() {
		describe('Agfam2ToolRunner', function() {
			let Aseq = null
			before(() => {
				let bootService = new MistBootService()
				Aseq = bootService.setupModels().Aseq
			})

			it('computes and updates aseqs agfam2 field', function() {
				let hmmDbConfig = {
						databasePath,
						z: numHmms
					},
					x = new Agfam2ToolRunner(hmmDbConfig),
					aseqs = [
						Aseq.build(testData[2].coreData)
					]
				expect(aseqs[0].agfam2).not.ok

				return x.run(aseqs)
				.then((resultAseqs) => {
					expect(aseqs).equal(resultAseqs)
					expect(aseqs[0].agfam2).eql(testData[2].agfam2)
				})
			})
		})
	})
})
