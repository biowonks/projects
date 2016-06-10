/* eslint-disable no-new, no-unused-expressions, no-undefined, no-magic-numbers */

'use strict'

let GenbankKeywordNode = require('./GenbankKeywordNode')

describe('GenbankKeywordNode', function() {
	describe('constructor', function() {
		let badLines = [
			0,
			true,
			false,
			[],
			{}
		]

		badLines.forEach((badLine) => {
			it(`throws error if instantiated with non-string argument ${JSON.stringify(badLine)}`, function() {
				expect(function() {
					new GenbankKeywordNode('DUMMY', badLine)
				}).throw(Error)
			})
		})

		it('keyword without line', function() {
			new GenbankKeywordNode('FEATURES')
		})

		it('keyword with line', function() {
			new GenbankKeywordNode('REFERENCE', '1')
		})
	})

	describe('addChild', function() {
		it('cannot add child to itself', function() {
			expect(function() {
				let root = new GenbankKeywordNode('ROOT')
				root.addChild(root)
			}).throw(Error)
		})

		it('cannot add child that already has a parent', function() {
			let root1 = new GenbankKeywordNode('ROOT1'),
				root2 = new GenbankKeywordNode('ROOT2'),
				child = new GenbankKeywordNode('  CHILD')

			root1.addChild(child)
			expect(function() {
				root2.addChild(child)
			}).throw(Error)
		})

		it('cannot add child two levels deeper than current node', function() {
			let root = new GenbankKeywordNode('ROOT'),
				child = new GenbankKeywordNode('   CHILD')

			expect(function() {
				root.addChild(child)
			}).throw(Error)
		})

		it('basic usage', function() {
			let root = new GenbankKeywordNode('ROOT'),
				child = new GenbankKeywordNode('  CHILD')

			root.addChild(child)
		})

		it('using a child with the same keyword throws error', function() {
			let root = new GenbankKeywordNode('ROOT'),
				child1 = new GenbankKeywordNode('  CHILD'),
				child2 = new GenbankKeywordNode('  CHILD')

			root.addChild(child1)
			expect(function() {
				root.addChild(child2)
			}).throw(Error)
		})
	})

	describe('child', function() {
		let root = new GenbankKeywordNode('ROOT'),
			child1 = new GenbankKeywordNode('  CHILD1'),
			child2 = new GenbankKeywordNode('  CHILD2')

		root.addChild(child1)
		root.addChild(child2)

		it('non-existent child returns null', function() {
			expect(root.child()).undefined
		})

		it('returns actual child with existent keyword', function() {
			expect(root.child('  CHILD1')).equal(child1)
			expect(root.child('  CHILD2')).equal(child2)
		})
	})

	describe('hasChildren', function() {
		it('root without children returns false', function() {
			let root = new GenbankKeywordNode('ROOT')
			expect(root.hasChildren()).false
		})

		it('root with a child returns true', function() {
			let root = new GenbankKeywordNode('ROOT'),
				child = new GenbankKeywordNode('  CHILD')

			root.addChild(child)

			expect(root.hasChildren()).true
		})
	})

	describe('joinedLines', function() {
		it('no lines returns empty string', function() {
			let root = new GenbankKeywordNode('ROOT')
			expect(root.joinedLines()).equal('')
		})

		it('single line in constructor returns that line', function() {
			let root = new GenbankKeywordNode('ROOT', 'coli')
			expect(root.joinedLines()).equal('coli')
		})

		it('multiple lines are joined with a single space', function() {
			let root = new GenbankKeywordNode('ROOT', 'coli')
			root.pushLine('coli')
			expect(root.joinedLines()).equal('coli coli')
		})
	})

	describe('keyword', function() {
		it('returns constructed keyword', function() {
			let root = new GenbankKeywordNode('ROOT')
			expect(root.keyword()).equal('ROOT')
		})

		it('whitespace is treated as part of the keyword', function() {
			let root = new GenbankKeywordNode('  ROOT ')
			expect(root.keyword()).equal('  ROOT ')
		})
	})

	describe('level', function() {
		it('"node" returns 0', function() {
			let x = new GenbankKeywordNode('node')
			expect(x.level()).equal(0)
		})

		it('"  node" returns 1', function() {
			let x = new GenbankKeywordNode('  node')
			expect(x.level()).equal(1)
		})

		it('"   node" returns 2', function() {
			let x = new GenbankKeywordNode('   node')
			expect(x.level()).equal(2)
		})

		it('" node" throws error', function() {
			expect(function() {
				new GenbankKeywordNode(' node')
			}).throw(Error)
		})

		it('"    node" throws error', function() {
			expect(function() {
				new GenbankKeywordNode('    node')
			}).throw(Error)
		})
	})

	describe('lines', function() {
		it('constructor with no value returns empty array', function() {
			let x = new GenbankKeywordNode('root')
			expect(x.lines()).deep.equal([])
		})

		it('constructor with a value returns that line (whitespace preserved)', function() {
			let x = new GenbankKeywordNode('root', ' line 1 ')
			expect(x.lines()).deep.equal([' line 1 '])
		})
	})

	describe('parent', function() {
		it('root has no parent', function() {
			let root = new GenbankKeywordNode('ROOT')
			expect(root.parent()).null
		})

		it('child returns parent node', function() {
			let root = new GenbankKeywordNode('ROOT'),
				child = new GenbankKeywordNode('  CHILD')

			root.addChild(child)

			expect(child.parent()).equal(root)
		})
	})

	describe('pushLine', function() {
		it('blank line is added', function() {
			let root = new GenbankKeywordNode('ROOT')
			root.pushLine()
			root.pushLine('')
			root.pushLine('abc')
			expect(root.lines()).deep.equal([
				undefined,
				'',
				'abc'
			])
		})
	})
})
