/* eslint-disable no-new, no-unused-expressions, no-magic-numbers */

'use strict'

// Local
let ModuleDepNode = require('./ModuleDepNode')

describe('pipeline', function() {
	describe('ModuleDepNode', function() {
		it('constructor', function() {
			new ModuleDepNode()
			new ModuleDepNode('name')
			new ModuleDepNode('name', {})
		})

		describe('dependsOn', function() {
			let root = ModuleDepNode.createFromDepList([
					{name: 'A',		dependencies: []},
					{name: 'B1',	dependencies: ['A']},
					{name: 'B2',	dependencies: ['A']},
					{name: 'C',		dependencies: ['B1', 'B2']},

					{name: 'A2',	dependencies: []},
					{name: 'B3',	dependencies: ['A2']}
				]),
				map = root.nameNodeMap(),
				A = map.get('A'),
				B1 = map.get('B1'),
				B2 = map.get('B2'),
				C = map.get('C'),
				A2 = map.get('A2'),
				B3 = map.get('B3')

			it('A !-> B1 or A2', function() {
				expect(A.dependsOn(B1)).false
				expect(A.dependsOn(A2)).false
			})

			it('B1 dependsOn A', function() {
				expect(B1.dependsOn(A)).true
			})

			it('C dependsOn A, B1, and B2', function() {
				expect(C.dependsOn(A)).true
				expect(C.dependsOn(B1)).true
				expect(C.dependsOn(B2)).true
			})

			it('!A dependsOn C', function() {
				expect(A.dependsOn(C)).false
			})

			it('B3 dependsOn A2', function() {
				expect(B3.dependsOn(A2)).true
				expect(A2.dependsOn(B3)).false
			})
		})

		describe('depth of: A -> B1, A -> B2, B1 -> D, B2 -> C, C -> D', function() {
			let x = ModuleDepNode.createFromDepList([
					{name: 'A',		dependencies: []},
					{name: 'B1',	dependencies: ['A']},
					{name: 'B2',	dependencies: ['A']},
					{name: 'C',		dependencies: ['B2']},
					{name: 'D',		dependencies: ['B1', 'C']}
				]),
				nameNodeMap = x.nameNodeMap(x),
				inputs = [
					['A', 1],
					['B1', 2],
					['B2', 2],
					['C', 3],
					['D', 7]
				]

			it('root returns 0', function() {
				expect(x.depth()).equal(0)
			})

			for (let input of inputs) {
				let [name, expectedDepth] = input
				it(`${name} returns ${expectedDepth}`, function() {
					expect(nameNodeMap.get(name).depth()).equal(expectedDepth)
				})
			}
		})

		it('name', function() {
			let x = new ModuleDepNode('core-data')
			expect(x.name()).equal('core-data')

			let y = new ModuleDepNode(null)
			expect(y.name()).null
		})

		it('nameNodeMap', function() {
			let node = ModuleDepNode.createFromDepList([
					{name: 'A',		dependencies: []},
					{name: 'B1',		dependencies: ['A']},
					{name: 'B2',		dependencies: ['A']},
					{name: 'C',		dependencies: ['B1', 'B2']}
				]),
				x = node.nameNodeMap()

			expect(x.has('A')).true
			expect(x.get('A').name()).equal('A')
			expect(x.has('B1')).true
			expect(x.get('B1').name()).equal('B1')
			expect(x.has('B2')).true
			expect(x.get('B2').name()).equal('B2')
			expect(x.has('C')).true
			expect(x.get('C').name()).equal('C')
		})

		it('[set] WorkerModule', function() {
			let x = new ModuleDepNode('core-data')
			expect(x.workerModule()).null

			let mockWorkerModule = {
				module: 'core-data'
			}
			x.setWorkerModule(mockWorkerModule)
			expect(x.workerModule()).equal(mockWorkerModule)

			mockWorkerModule.module = 'not-core-data'
			expect(function() {
				x.setWorkerModule(mockWorkerModule)
			}).throw(Error)
		})

		describe('createFromDepList (static)', function() {
			function checkGraph(node, expected) {
				// Is node a root node?
				expect(node.name()).null
				expect(node.parents()).eql([])

				// Check the remainder :)
				checkGraph_(node.children(), expected)
			}

			function checkGraph_(nodeChildren, expected) {
				expect(nodeChildren.length).equal(expected.length)
				for (let i = 0, z = nodeChildren.length; i < z; i++) {
					let child = nodeChildren[i],
						expectedChild = expected[i]

					expect(child.name()).equal(expectedChild.name)
					let parentNames = child.parents().map((x) => x.name())
					expect(parentNames).eql(expectedChild.parentNames)
					checkGraph_(child.children(), expectedChild.children)
				}
			}

			it('empty array list returns single root node with no children', function() {
				let x = ModuleDepNode.createFromDepList([])
				checkGraph(x, [])
			})

			it('does not mutate input array', function() {
				let moduleNamesWithDeps = [
						{name: 'root1', dependencies: []}
					],
					copy = [
						{name: 'root1', dependencies: []}
					]

				ModuleDepNode.createFromDepList(moduleNamesWithDeps)

				expect(moduleNamesWithDeps).eql(copy)
			})

			it('single root node', function() {
				let x = ModuleDepNode.createFromDepList([
					{name: 'root1', dependencies: []}
				])
				checkGraph(x, [
					{
						name: 'root1',
						parentNames: [null],
						children: []
					}
				])
			})

			it('multiple root nodes', function() {
				let x = ModuleDepNode.createFromDepList([
					{name: 'root1', dependencies: []},
					{name: 'root2',	dependencies: []}
				])

				checkGraph(x, [
					{
						name: 'root1',
						parentNames: [null],
						children: []
					},
					{
						name: 'root2',
						parentNames: [null],
						children: []
					}
				])
			})

			it('A -> B1, A -> B2', function() {
				let x = ModuleDepNode.createFromDepList([
					{name: 'A', 	dependencies: []},
					{name: 'B1',	dependencies: ['A']},
					{name: 'B2',	dependencies: ['A']}
				])

				checkGraph(x, [
					{
						name: 'A',
						parentNames: [null],
						children: [
							{
								name: 'B1',
								parentNames: ['A'],
								children: []
							},
							{
								name: 'B2',
								parentNames: ['A'],
								children: []
							}
						]
					}
				])
			})

			it('A -> B1, A -> B2, A -> B3, B1 -> C, B3 -> C (diamond)', function() {
				let x = ModuleDepNode.createFromDepList([
					{name: 'A',		dependencies: []},
					{name: 'B1',	dependencies: ['A']},
					{name: 'B2',	dependencies: ['A']},
					{name: 'B3',	dependencies: ['A']},
					{name: 'C',		dependencies: ['B1', 'B3']}
				])

				let C = {
					name: 'C',
					parentNames: ['B1', 'B3'],
					children: []
				}

				checkGraph(x, [
					{
						name: 'A',
						parentNames: [null],
						children: [
							{
								name: 'B1',
								parentNames: ['A'],
								children: [
									C
								]
							},
							{
								name: 'B2',
								parentNames: ['A'],
								children: []
							},
							{
								name: 'B3',
								parentNames: ['A'],
								children: [
									C
								]
							}
						]
					}
				])
			})

			it('A -> B, B -> C, A -> C (out of order)', function() {
				let x = ModuleDepNode.createFromDepList([
					{name: 'C',		dependencies: ['A', 'B']},
					{name: 'B',		dependencies: ['A']},
					{name: 'A',		dependencies: []}
				])

				let C = {
					name: 'C',
					parentNames: ['A', 'B'],
					children: []
				}

				checkGraph(x, [
					{
						name: 'A',
						parentNames: [null],
						children: [
							{
								name: 'B',
								parentNames: ['A'],
								children: [
									C
								]
							},
							C
						]
					}
				])
			})

			// Error cases
			it('duplicate name throws error', function() {
				expect(function() {
					ModuleDepNode.createFromDepList([
						{name: 'A',		dependencies: []},
						{name: 'A',		dependencies: []}
					])
				}).throw(Error)
			})

			it('module depending on itself throws error', function() {
				expect(function() {
					ModuleDepNode.createFromDepList([
						{name: 'A', dependencies: ['A']}
					])
				}).throw(Error)
			})

			it('modules with dependencies on non-existent nodes throws error', function() {
				expect(function() {
					ModuleDepNode.createFromDepList([
						{name: 'A', dependencies: ['B']}
					])
				}).throw(Error)
			})
		})
	})
})
