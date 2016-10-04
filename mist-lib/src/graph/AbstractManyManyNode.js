'use strict'

module.exports =
class AbstractManyManyNode {
	/**
	 * A node with 0..M parents and 0..N children.
	 *
	 * @constructor
	 */
	constructor() {
		// Protected members
		this.parents_ = []
		this.children_ = []
	}

	/**
	 * @returns {Array.<AbstractManyManyNode>}
	 */
	children() {
		return this.children_
	}

	/**
	 * @returns {Number} - the cumulative depth of all paths from the root to this node
	 */
	depth() {
		let d = 0
		this.traverseParents(() => d++)
		return d
	}

	/**
	 * @returns {Array.<AbstractManyManyNode>}
	 */
	parents() {
		return this.parents_
	}

	/**
	 * Traverse this node and all children depth first calling ${callbackFn(node)} for each visited
	 * node.
	 *
	 * Note: if a node has multiple parents, it may be visited multiple times.
	 *
	 * @param {Function} callbackFn
	 */
	traverse(callbackFn) {
		callbackFn(this)
		for (let child of this.children_)
			child.traverse(callbackFn)
	}

	/**
	 * Traverses the parents of node in reverse depth-first order. Excludes the top-most root node
	 * (node without any parents).
	 *
	 * @param {Function} callbackFn - callback function to execute when visiting each parentNode
	 */
	traverseParents(callbackFn) {
		for (let parentNode of this.parents_) {
			callbackFn(parentNode)
			parentNode.traverseParents(callbackFn)
		}
	}

	traverseParentsEvery(conditionFn) {
		for (let parentNode of this.parents_)
			return conditionFn(parentNode) ? parentNode.traverseParentsEvery(conditionFn) : false

		return true
	}

	traverseParentsSome(conditionFn) {
		for (let parentNode of this.parents_)
			return conditionFn(parentNode) ? true : parentNode.traverseParentsSome(conditionFn)

		return false
	}
}
