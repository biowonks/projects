/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Core
const path = require('path')

// Local
const models = require('../../../models').withDummyConnection(),
	pfam30ToolRunner = require('./pfam30.tool-runner'),
	testData = require('./test-data')

// Other
const Aseq = models.Aseq,
	databasePath = path.resolve(__dirname, '..', '..', '..', 'pipeline', 'lib', 'streams', 'test-data', 'test.hmm'),
	numHmms = 16295

describe('services', function() {
	describe('AseqsService', function() {
		describe('pfam30 (tool runner)', function() {
			let pfamConfig = {
				databasePath,
				z: numHmms
			}

			it('empty array resolves to empty result array', function() {
				return pfam30ToolRunner([], pfamConfig)
				.then((result) => {
					expect(result).deep.eql([])
				})
			})

			it('computes and updates aseqs pfam30 field', function() {
				let aseq = Aseq.build(testData[2].coreData),
					aseqs = [aseq]

				expect(aseq.pfam30).not.ok

				return pfam30ToolRunner(aseqs, pfamConfig)
				.then((resultAseqs) => {
					expect(aseqs === resultAseqs)
					expect(aseqs[0].pfam30).eql(testData[2].pfam30)
				})
			})
		})
	})
})
