/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Core
const path = require('path')

// Local
const models = require('../../../models').withDummyConnection(),
	Pfam30ToolRunner = require('./Pfam30ToolRunner'),
	testData = require('./test-data')

// Other
const Aseq = models.Aseq,
	databasePath = path.resolve(__dirname, '..', '..', '..', 'pipeline', 'lib', 'streams', 'test-data', 'test.hmm'),
	numHmms = 16295

describe('services', function() {
	describe('AseqsService', function() {
		describe('Pfam30ToolRunner', function() {
			it('computes and updates aseqs pfam30 field', function() {
				let pfamConfig = {
						databasePath,
						z: numHmms
					},
					x = new Pfam30ToolRunner(pfamConfig),
					aseqs = [
						Aseq.build(testData[2].coreData)
					]
				expect(aseqs[0].pfam30).not.ok

				return x.run(aseqs)
				.then((resultAseqs) => {
					expect(aseqs).equal(resultAseqs)
					expect(aseqs[0].pfam30).eql(testData[2].pfam30)
				})
			})
		})
	})
})
