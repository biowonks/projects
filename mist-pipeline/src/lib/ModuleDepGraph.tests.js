/* eslint-disable no-new, no-unused-expressions, no-magic-numbers, no-mixed-requires, one-var-declaration-per-line */

'use strict'

// Vendor
const bunyan = require('bunyan')

// Local
const MistBootService = require('mist-lib/services/MistBootService'),
	ModuleDepNode = require('./ModuleDepNode'),
	ModuleDepGraph = require('./ModuleDepGraph'),
	ModuleId = require('./ModuleId')

describe('pipeline', function() {
	describe('ModuleDepGraph', function() {
		let models = null,
			WorkerModule = null
		before(() => {
			let bootService = new MistBootService()
			models = bootService.setupModels()
			WorkerModule = models.WorkerModule
		})

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
			A = nameMap.get('A'),	Aid = new ModuleId('A'),
			B = nameMap.get('B'),	Bid = new ModuleId('B'),
			C = nameMap.get('C'),	Cid = new ModuleId('C'),
			D = nameMap.get('D'),	Did = new ModuleId('D'),
			F = nameMap.get('F'),	Fid = new ModuleId('F'),
			G = nameMap.get('G'),	Gid = new ModuleId('G'),
			H = nameMap.get('H'),	Hid = new ModuleId('H')

		beforeEach(() => {
			root.traverse((node) => {
				node.setWorkerModule(null)
			})
		})

		function checkModuleIdArray(result, expectedArray) {
			expect(result).a('array')
			expect(result.length).equal(expectedArray.length)
			result.forEach((moduleId, i) => {
				expect(moduleId.toString()).equal(expectedArray[i].toString())
			})
		}

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

		describe('updateState', function() {
			it('sets worker modules to identically named nodes and does not clear previous state', function() {
				let x = new ModuleDepGraph(root, logger),
					wmA = WorkerModule.build({module: 'A'}),
					wmH = WorkerModule.build({module: 'H'})
				x.loadState([wmA])
				x.updateState([wmH])
				root.traverse((node) => {
					if (node.name() === 'A')
						expect(node.workerModule()).equal(wmA)
					else if (node.name() === 'H')
						expect(node.workerModule()).equal(wmH)
					else
						expect(node.workerModule()).null
				})
			})

			it('throws error if no logger and attempt to update non-cognate worker module', function() {
				let x = new ModuleDepGraph(root),
					wm = WorkerModule.build({module: 'Doesnt exist'})
				expect(function() {
					x.updateState([wm])
				}).throw(Error)
			})
		})

		describe('removeState', function() {
			it('removes any matching worker modules', function() {
				let x = new ModuleDepGraph(root, logger),
					wmA = WorkerModule.build({module: 'A'}),
					wmH = WorkerModule.build({module: 'H'})
				x.loadState([wmA])
				x.removeState([wmH])
				root.traverse((node) => {
					if (node.name() === 'A')
						expect(node.workerModule()).equal(wmA)
					else
						expect(node.workerModule()).null
				})
			})

			it('throws error if no logger and attempt to remove non-cognate worker module', function() {
				let x = new ModuleDepGraph(root),
					wm = WorkerModule.build({module: 'Doesnt exist'})
				expect(function() {
					x.removeState([wm])
				}).throw(Error)
			})
		})

		describe('moduleIdsInStates', function() {
			let x = new ModuleDepGraph(root, logger)

			beforeEach(() => {
				let wmA = WorkerModule.build({module: 'A', state: 'done'}),
					wmB = WorkerModule.build({module: 'B', state: 'done'}),
					wmC = WorkerModule.build({module: 'C', state: 'active'}),
					wmD = WorkerModule.build({module: 'D', state: 'undo'}),
					wmE = WorkerModule.build({module: 'E', state: 'error'})
				x.loadState([wmA, wmB, wmC, wmD, wmE])
			})

			it('no states listed, returns empty array', function() {
				expect(x.moduleIdsInStates()).eql([])
			})

			it('done states', function() {
				let result = x.moduleIdsInStates('done')
				checkModuleIdArray(result, [Aid, Bid])
			})

			it('mixed array of states', function() {
				let result = x.moduleIdsInStates('active', 'undo')
				checkModuleIdArray(result, [Cid, Did])
			})
		})

		describe('missingDependencies', function() {
			let x = new ModuleDepGraph(root)
			describe('empty state', function() {
				it('"root" nodes have no missing dependencies', function() {
					expect(x.missingDependencies(Aid)).eql([])
					expect(x.missingDependencies(Bid)).eql([])
				})

				it('C missing B', function() {
					expect(x.missingDependencies(Cid)).eql(['B'])
				})

				it('F missing C, B, and D', function() {
					expect(x.missingDependencies(Fid)).eql(['C', 'B', 'D'])
				})

				it('H missing F, C, B, D, E, and G', function() {
					expect(x.missingDependencies(Hid)).eql(['F', 'C', 'B', 'D', 'G'])
				})
			})

			describe('partial state', function() {
				it('done B, C has no missing dependencies', function() {
					B.setWorkerModule(WorkerModule.build({module: 'B', state: 'done'}))
					expect(x.missingDependencies(Cid)).eql([])
				})

				it('error B count as missing dependency', function() {
					B.setWorkerModule(WorkerModule.build({module: 'B', state: 'error'}))
					expect(x.missingDependencies(Cid)).eql(['B'])
				})

				it('B undone, C done, D done, F input returns B as missing dependency', function() {
					C.setWorkerModule(WorkerModule.build({module: 'C', state: 'done'}))
					D.setWorkerModule(WorkerModule.build({module: 'D', state: 'done'}))
					expect(x.missingDependencies(Fid)).eql(['B'])
				})

				it('multiple dependencies', function() {
					B.setWorkerModule(WorkerModule.build({module: 'B', state: 'done'}))
					C.setWorkerModule(WorkerModule.build({module: 'C', state: 'error'}))
					D.setWorkerModule(WorkerModule.build({module: 'D', state: 'done'}))
					expect(x.missingDependencies(Hid)).eql(['F', 'C', 'G'])
				})
			})
		})

		describe('moduleIdsDependingOn', function() {
			let x = new ModuleDepGraph(root)

			it('no worker modules returns empty array', function() {
				expect(x.moduleIdsDependingOn(Aid)).eql([])
				expect(x.moduleIdsDependingOn(Bid)).eql([])
				expect(x.moduleIdsDependingOn(Fid)).eql([])
			})

			it('does not include currently referenced node', function() {
				B.setWorkerModule(WorkerModule.build({module: 'B', state: 'done'}))
				expect(x.moduleIdsDependingOn(Bid)).eql([])
			})

			it('all descendant nodes with done worker modules are identified', function() {
				B.setWorkerModule(WorkerModule.build({module: 'B', state: 'done'}))
				C.setWorkerModule(WorkerModule.build({module: 'C', state: 'error'}))
				D.setWorkerModule(WorkerModule.build({module: 'D', state: 'done'}))
				F.setWorkerModule(WorkerModule.build({module: 'F', state: 'done'}))

				let result = x.moduleIdsDependingOn(Bid)
				checkModuleIdArray(result, [Fid, Did])
			})
		})

		describe('doneModuleIds', function() {
			it('returns moduleIds that are done', function() {
				let x = new ModuleDepGraph(root)
				B.setWorkerModule(WorkerModule.build({module: 'B', state: 'done'}))
				C.setWorkerModule(WorkerModule.build({module: 'C', state: 'error'}))
				D.setWorkerModule(WorkerModule.build({module: 'D', state: 'done'}))
				F.setWorkerModule(WorkerModule.build({module: 'F', state: 'done'}))

				expect(x.doneModuleIds([])).eql([])
				expect(x.doneModuleIds([Aid])).eql([])
				checkModuleIdArray(x.doneModuleIds([Aid, Bid]), [Bid])

				checkModuleIdArray(x.doneModuleIds([
					Aid, Bid, Cid, Fid, Gid, Hid // Note - Did is excluded
				]), [Bid, Fid])
			})
		})

		describe('matchingModuleIds', function() {
			it('returns matching modules based on our custom matching function', function() {
				let x = new ModuleDepGraph(root),
					result = x.matchingModuleIds([Aid, Bid, Hid], (node) => /^(A|H)$/.test(node.name()))

				checkModuleIdArray(result, [Aid, Hid])
			})
		})

		describe('incompleteModuleIds', function() {
			let x = new ModuleDepGraph(root)
			it('no worker module is incomplete', function() {
				let result = x.incompleteModuleIds([Aid])
				checkModuleIdArray(result, [Aid])
			})

			it('worker module with done state is not incomplete', function() {
				G.setWorkerModule(WorkerModule.build({module: 'G', state: 'done'}))
				expect(x.incompleteModuleIds([Gid])).eql([])
			})

			it('multiple module ids as input', function() {
				A.setWorkerModule(WorkerModule.build({module: 'A', state: 'done'}))
				B.setWorkerModule(WorkerModule.build({module: 'B', state: 'done'}))
				D.setWorkerModule(WorkerModule.build({module: 'D', state: 'error'}))

				let result = x.incompleteModuleIds([Aid, Bid, Cid, Did])
				checkModuleIdArray(result, [Cid, Did])
			})
		})

		describe('orderByDepth', function() {
			let x = new ModuleDepGraph(root)

			function checkOrder(input, output) {
				let result = x.orderByDepth(input)
				checkModuleIdArray(result, output)
			}

			it('[C, B] -> [B, C]', function() {
				checkOrder([Cid, Bid], [Bid, Cid])
			})

			it('[H, B] -> [B, H]', function() {
				checkOrder([Hid, Bid], [Bid, Hid])
			})

			it('[C, F, A, D, B] -> [A, B, C, D, F]', function() {
				checkOrder([Cid, Fid, Aid, Did, Bid], [Aid, Bid, Cid, Did, Fid])
			})

			it('[D, C] -> [D, C]', function() {
				checkOrder([Did, Cid], [Did, Cid])
			})
		})

		describe('reverseOrderByDepth', function() {
			let x = new ModuleDepGraph(root)

			function checkReverseOrder(input, output) {
				let result = x.reverseOrderByDepth(input)
				checkModuleIdArray(result, output)
			}

			it('[B, C] -> [C, B]', function() {
				checkReverseOrder([Bid, Cid], [Cid, Bid])
			})

			it('[B, H] -> [H, B]', function() {
				checkReverseOrder([Bid, Hid], [Hid, Bid])
			})

			it('[A, C, D, F, B] -> [F, C, D, A, B]', function() {
				checkReverseOrder([Aid, Cid, Did, Fid, Bid], [Fid, Cid, Did, Aid, Bid])
			})

			it('[C, D] -> [C, D]', function() {
				checkReverseOrder([Cid, Did], [Cid, Did])
			})
		})

		describe('toNodes', function() {
			let x = new ModuleDepGraph(root)
			it('[A, F, G] returns those nodes', function() {
				expect(x.toNodes([Aid, Fid, Gid])).eql([A, F, G])
			})
		})
	})
})
