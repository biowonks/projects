/* eslint-disable no-new, no-unused-expressions, no-magic-numbers */

'use strict'

// Vendor
const bunyan = require('bunyan')

// Local
const models = require('../../models').withDummyConnection(),
	ModuleDepNode = require('./ModuleDepNode'),
	ModuleDepGraph = require('./ModuleDepGraph'),
	ModuleId = require('./ModuleId')

const WorkerModule = models.WorkerModule

describe('pipeline', function() {
	describe.only('ModuleDepGraph', function() {
		let logger = bunyan.createLogger({name: 'ModuleDepGraph test'}),
			depList = [
				{name: 'A',		dependencies: []},
				{name: 'B',		dependencies: []},
				{name: 'C',		dependencies: ['B']},
				{name: 'D',		dependencies: ['B']},
				{name: 'E',		dependencies: ['B']},
				{name: 'F',		dependencies: ['C', 'D']},
				{name: 'G',		dependencies: []},
				{name: 'H',		dependencies: ['F', 'G']}
			],
			root = ModuleDepNode.createFromDepList(depList),
			nameMap = root.nameNodeMap(),
			A = nameMap.get('A'),
			B = nameMap.get('B'),
			C = nameMap.get('C'),
			D = nameMap.get('D'),
			E = nameMap.get('E'),
			F = nameMap.get('F'),
			G = nameMap.get('G'),
			H = nameMap.get('H')

		beforeEach(() => {
			root.traverse((node) => {
				node.setWorkerModule(null)
			})
		})

		it('constructor and default state', function() {
			new ModuleDepGraph(root, logger)
		})

		describe('loadState', function() {
			it('sets worker modules to identically named nodes', function() {
				let x = new ModuleDepGraph(root, logger),
					wmA = WorkerModule.build({module: 'A'}),
					wmH = WorkerModule.build({module: 'H'})
				x.loadState([wmA, wmH])
				root.traverse((node) => {
					if (node.name() === 'A')
						expect(node.workerModule()).equal(wmA)
					else if (node.name() === 'H')
						expect(node.workerModule()).equal(wmH)
					else
						expect(node.workerModule()).null
				})
			})

			it('throws error if no logger and attempt to load non-cognate worker module', function() {
				let x = new ModuleDepGraph(root),
					wm = WorkerModule.build({module: 'Doesnt exist'})
				expect(function() {
					x.loadState([wm])
				}).throw(Error)
			})

			it('clears any previously defined state', function() {
				let x = new ModuleDepGraph(root, logger),
					wmA = WorkerModule.build({module: 'A'}),
					wmH = WorkerModule.build({module: 'H'})
				x.loadState([wmA, wmH])
				expect(A.workerModule()).equal(wmA)
				expect(H.workerModule()).equal(wmH)
				x.loadState([])
				root.traverse((node) => {
					expect(node.workerModule()).null
				})
			})
		})
	})
})
