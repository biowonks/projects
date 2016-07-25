/* eslint-disable no-magic-numbers */

'use strict'

// Core
const path = require('path')

// Local
const putil = require('./putil'),
	ModuleId = require('./ModuleId'),

	OnceOneModule = require('./test-data/module-dir1/OnceOneModule'),
	OnceTwoModule = require('./test-data/module-dir1/OnceTwoModule'),
	PerGenomeOneModule = require('./test-data/module-dir1/PerGenomeOneModule'),

	OnceThreeModule = require('./test-data/module-dir2/OnceThreeModule'),
	PerGenomeTwoModule = require('./test-data/module-dir2/PerGenomeTwoModule'),
	PerGenomeThreeModule = require('./test-data/module-dir2/PerGenomeThreeModule')

describe('pipeline', function() {
	describe('putil', function() {
		it('enumerateModules', function() {
			let x = putil.enumerateModules(
				path.resolve(__dirname, 'test-data', 'module-dir1'),
				path.resolve(__dirname, 'test-data', 'module-dir2')
			)

			expect(x).a('object')
			expect(x).property('once')
			expect(x.once).a('array')
			expect(x.once.length).equal(3)
			expect(x.once).members([OnceOneModule, OnceTwoModule, OnceThreeModule])

			expect(x).property('perGenome')
			expect(x.perGenome).a('array')
			expect(x.perGenome.length).equal(3)
			expect(x.perGenome).members([PerGenomeOneModule, PerGenomeTwoModule, PerGenomeThreeModule])

			expect(x).property('all')
			expect(x.all).eql([...x.once, ...x.perGenome])
		})

		it('findInvalidModuleIds', function() {
			let moduleIds = [
					new ModuleId('OnceOneModule'),
					new ModuleId('OnceTwoModule'),
					new ModuleId('InvalidModule'),
					new ModuleId('PerGenomeOneModule'),
					new ModuleId('PerGenomeOneModule', ['subModule1', 'subModule2', 'invalid'])
				],
				x = putil.findInvalidModuleIds(moduleIds, [
					OnceOneModule,
					PerGenomeOneModule
				])

			expect(x).a('array')
			expect(x.length).equal(4)
			expect(x[0].toString()).equal('OnceTwoModule')
			expect(x[1].toString()).equal('InvalidModule')
			expect(x[2].toString()).equal('PerGenomeOneModule')
			expect(x[3].toString()).equal('PerGenomeOneModule:invalid')
		})

		it('unnestedDependencyArray', function() {
			let x = putil.unnestedDependencyArray([
				OnceOneModule,
				OnceTwoModule,
				PerGenomeOneModule,
				PerGenomeTwoModule
			])
			expect(x).eql([
				{
					name: 'OnceOneModule',
					dependencies: []
				},
				{
					name: 'OnceTwoModule',
					dependencies: []
				},
				{
					name: 'PerGenomeOneModule:subModule1',
					dependencies: ['OnceTwoModule']
				},
				{
					name: 'PerGenomeOneModule:subModule2',
					dependencies: ['OnceTwoModule']
				},
				{
					name: 'PerGenomeTwoModule',
					dependencies: []
				}
			])
		})

		it('mapModuleClassesByName', function() {
			let x = putil.mapModuleClassesByName([OnceOneModule, PerGenomeOneModule])
			expect(Array.from(x.keys())).eql(['OnceOneModule', 'PerGenomeOneModule'])
		})
	})
})
