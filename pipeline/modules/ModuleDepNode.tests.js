/* eslint-disable no-new, no-unused-expressions */

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

		it('name', function() {
			let x = new ModuleDepNode('core-data')
			expect(x.name()).equal('core-data')

			let y = new ModuleDepNode(null)
			expect(y.name()).null
		})

		it('[set] WorkerModule', function() {
			let x = new ModuleDepNode('core-data')
			expect(x.workerModule()).null

			let mockWorkerModule = {
				name: 'core-data'
			}
			x.setWorkerModule(mockWorkerModule)
			expect(x.workerModule()).equal(mockWorkerModule)

			mockWorkerModule.name = 'not-core-data'
			expect(function() {
				x.setWorkerModule(mockWorkerModule)
			}).throw(Error)
		})

		describe('createFromDepList', function() {
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
						{name: 'root1', deps: []}
					],
					copy = [
						{name: 'root1', deps: []}
					]

				ModuleDepNode.createFromDepList(moduleNamesWithDeps)

				expect(moduleNamesWithDeps).eql(copy)
			})

			it('single root node', function() {
				let x = ModuleDepNode.createFromDepList([
					{name: 'root1', deps: []}
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
					{name: 'root1', deps: []},
					{name: 'root2',	deps: []}
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
					{name: 'A', 	deps: []},
					{name: 'B1',	deps: ['A']},
					{name: 'B2',	deps: ['A']}
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
					{name: 'A',		deps: []},
					{name: 'B1',	deps: ['A']},
					{name: 'B2',	deps: ['A']},
					{name: 'B3',	deps: ['A']},
					{name: 'C',		deps: ['B1', 'B3']}
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
					{name: 'C',		deps: ['A', 'B']},
					{name: 'B',		deps: ['A']},
					{name: 'A',		deps: []}
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
						{name: 'A',		deps: []},
						{name: 'A',		deps: []}
					])
				}).throw(Error)
			})

			it('module depending on itself throws error', function() {
				expect(function() {
					ModuleDepNode.createFromDepList([
						{name: 'A', deps: ['A']}
					])
				}).throw(Error)
			})

			it('modules with dependencies on non-existent nodes throws error', function() {
				expect(function() {
					ModuleDepNode.createFromDepList([
						{name: 'A', deps: ['B']}
					])
				}).throw(Error)
			})
		})
	})
})
