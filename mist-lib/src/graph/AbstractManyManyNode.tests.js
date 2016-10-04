/* eslint-disable no-new, no-magic-numbers, no-unused-expressions */

'use strict'

// Local
const AbstractManyManyNode = require('./AbstractManyManyNode')

class MockNode extends AbstractManyManyNode {
	constructor(name) {
		super()
		this.name = name
	}

	addChild(child) {
		this.children_.push(child)
		child.parents_.push(this)
		// let childNode = new MockNode(childName)
		// this.children_.push(childNode)
		// return childNode
	}
}

describe('data-structures', function() {
	describe('AbstractManyManyNode', function() {
		let root = new MockNode('root'),
			A = new MockNode('A'),
			A2 = new MockNode('A2'),
			B = new MockNode('B')

		root.addChild(A)
		root.addChild(A2)
		A.addChild(B)
		A2.addChild(B)

		it('children and parents', function() {
			expect(root.parents().length).equal(0)
			expect(root.children().length).equal(2)

			expect(A.parents()).eql([root])
			expect(A2.parents()).eql(A.parents())
			expect(A.children()).eql([B])
			expect(B.parents()).eql([A, A2])
			expect(A2.children()).eql([B])
		})

		describe('depth', function() {
			[
				{node: root, expectedDepth: 0},
				{node: A, expectedDepth: 1},
				{node: A2, expectedDepth: 1},
				{node: B, expectedDepth: 4}
			]
			.forEach((fixture) => {
				it(`${fixture.node.name} depth equals ${fixture.expectedDepth}`, function() {
					expect(fixture.node.depth()).equal(fixture.expectedDepth)
				})
			})
		})

		describe('traverse', function() {
			it('from root, node with multiple parents is visited twice', function() {
				let names = []
				root.traverse((node) => names.push(node.name))
				expect(names).eql([
					'root',
					'A',
					'B',
					'A2',
					'B'
				])
			})

			it('from intermediate node', function() {
				let names = []
				A.traverse((node) => names.push(node.name))
				expect(names).eql([
					'A',
					'B'
				])
			})

			it('from leaf node', function() {
				let names = []
				B.traverse((node) => names.push(node.name))
				expect(names).eql([
					'B'
				])
			})
		})

		describe('traverseParents', function() {
			it('from root', function() {
				let names = []
				root.traverseParents((node) => names.push(node.name))
				expect(names).eql([])
			})

			it('from intermediate node', function() {
				let names = []
				A.traverseParents((node) => names.push(node.name))
				expect(names).eql(['root'])
			})

			it('from leaf node; with multiple parents', function() {
				let names = []
				B.traverseParents((node) => names.push(node.name))
				expect(names).eql([
					'A',
					'root',
					'A2',
					'root'
				])
			})
		})

		describe('traverseParentsEvery', function() {
			it('from root', function() {
				let x = root.traverseParentsEvery((node) => false)
				expect(x).true
				x = root.traverseParentsEvery((node) => true)
				expect(x).true
			})

			it('single truthy path', function() {
				let x = A.traverseParentsEvery((node) => node.name === 'root')
				expect(x).true
			})

			it('single falsy path', function() {
				let x = A.traverseParentsEvery((node) => node.name !== 'root')
				expect(x).false
			})

			it('multiple truthy path', function() {
				let x = B.traverseParentsEvery((node) => ['root', 'A', 'A2'].includes(node.name))
				expect(x).true
			})

			it('multiple falsy path', function() {
				let x = B.traverseParentsEvery((node) => ['root', 'A2'].includes(node.name))
				expect(x).false
			})
		})

		describe('traverseParentsSome', function() {
			it('from root', function() {
				let x = root.traverseParentsSome((node) => false)
				expect(x).false
				x = root.traverseParentsSome((node) => true)
				expect(x).false
			})

			it('no truthy matches', function() {
				[root, A, A2, B].forEach((inputNode) => {
					expect(inputNode.traverseParentsSome((node) => node.name === 'doesnt exist')).false
				})
			})

			it('single truthy match', function() {
				[A, A2, B].forEach((inputNode) => {
					expect(inputNode.traverseParentsSome((node) => node.name === 'root')).true
				})
			})

			it('multiple truthy path', function() {
				let x = B.traverseParentsSome((node) => ['A', 'A2'].includes(node.name))
				expect(x).true
			})
		})
	})
})
