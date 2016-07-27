/* eslint-disable no-unused-expressions, global-require, no-mixed-requires, no-magic-numbers */

/**
 * Note: somehow when a shallow comparison of Aseq instances fails, expect / chai enumerates the
 * full Instance, which in turn triggers an attempt to load the pg-native module. Not sure why this
 * happens, thus, all comparison of Aseq instances should be done using === and true / false. For
 * example, use:
 *
 * expect(result === aseq).true
 *
 * instead of:
 *
 * expect(result).equal(aseq)
 *
 * Not identical, but related issue: https://github.com/sequelize/sequelize/issues/3781
 */

'use strict'

// Local
const AseqsService = require('./index'),
	Seq = require('../../pipeline/lib/bio/Seq'),
	config = require('../../config'),
	models = require('../../models').withDummyConnection(),
	testData = require('./tool-runners/test-data')

// Other
const Aseq = models.Aseq

describe('services', function() {
	describe('AseqsService', function() {
		describe('tools (static method)', function() {
			it('should return an array of tool-runners', function() {
				let tools = AseqsService.tools()
				expect(tools).a('Array')
				for (let tool of tools) {
					expect(tool).a('Object')
					expect(tool.id).not.empty
					expect(tool.id).a('String')

					// Special check for the coils meta
					if (tool.id === 'coils') {
						Reflect.deleteProperty(tool, 'id')

						let coilsToolRunner = require('./tool-runners/coils.tool-runner.js')
						expect(tool).deep.equal(coilsToolRunner.meta)

						tool.id = 'coils'
					}
				}
			})
		})

		describe('compute', function() {
			it('runs coils and segs on the given aseqs', function() {
				let aseqs = [
					Aseq.build(testData[0].coreData),
					Aseq.build(testData[1].coreData)
				]

				let x = new AseqsService(Aseq, config)
				return x.compute(aseqs, ['coils', 'segs'])
				.then((resultAseqs) => {
					expect(resultAseqs).equal(aseqs)
					for (let i = 0; i < aseqs.length; i++) {
						expect(resultAseqs[i] === aseqs[i]).true
						expect(aseqs[i].coils).eql(testData[i].coils)
						expect(aseqs[i].segs).eql(testData[i].segs)
					}
				})
			})
		})

		describe('groupByUndoneTools', function() {
			let seq1 = new Seq('MLTNY'),
				seq2 = new Seq('MLTNW'),
				seq3 = new Seq('MLTNC'),
				seq4 = new Seq('MLTND')

			it('throws error if either argument is not an array', function() {
				let x = new AseqsService(Aseq, config)
				expect(function() {
					x.groupByUndoneTools()
				}).throw(Error)

				expect(function() {
					x.groupByUndoneTools(null, [])
				}).throw(Error)
			})

			it('returns single element with all aseqs if all tools are done', function() {
				let x = new AseqsService(Aseq, config),
					toolIds = ['segs', 'coils'],
					aseqs = [
						Aseq.fromSeq(seq1),
						Aseq.fromSeq(seq2),
						Aseq.fromSeq(seq3)
					]

				aseqs.forEach((aseq) => {
					toolIds.forEach((toolId) => {
						aseq[toolId] = 1
					})
				})

				let result = x.groupByUndoneTools(aseqs, toolIds)
				expect(result[0]).a('Object')
				expect(result[0].toolIds).deep.equal([])
				expect(result[0].aseqs.length).equal(3)
				for (let i = 0; i < aseqs.length; i++)
					expect(result[0].aseqs[i] === aseqs[i]).true
			})

			it('returns all possible groupings (and multiple members)', function() {
				let x = new AseqsService(Aseq, config),
					toolIds = ['segs', 'coils'],
					aseqs = [
						Aseq.fromSeq(seq1), // 0
						Aseq.fromSeq(seq2), // 1
						Aseq.fromSeq(seq3), // 2
						Aseq.fromSeq(seq4), // 3
						Aseq.fromSeq(seq2)  // 4
					]

				// ---------------------
				// Set the done tool ids
				// aseqs.0: coils + segs
				aseqs[0].segs = 1
				aseqs[0].coils = 1
				// aseqs.1: coils
				aseqs[1].coils = 1
				// aseqs.2: segs
				aseqs[2].segs = 1
				// aseqs.3: none
				// aseqs.4: coils
				aseqs[4].coils = 1

				let result = x.groupByUndoneTools(aseqs, toolIds)
				expect(result.length).equal(4)
				expect(result[0].toolIds).eql([])
				expect(result[0].aseqs[0] === aseqs[0]).true

				expect(result[1].toolIds).eql(['segs'])
				expect(result[1].aseqs.length).equal(2)
				expect(result[1].aseqs[0] === aseqs[1]).true
				expect(result[1].aseqs[1] === aseqs[4]).true

				expect(result[2].toolIds).eql(['coils'])
				expect(result[2].aseqs[0] === aseqs[2]).true

				expect(result[3].toolIds).eql(['segs', 'coils'])
				expect(result[3].aseqs[0] === aseqs[3]).true
			})
		})
	})
})
