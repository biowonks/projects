'use strict'

// Local
const AbstractManyManyNode = require('./AbstractManyManyNode')

module.exports =
class DepNode extends AbstractManyManyNode {
	/**
	 * Sub-classes should override this method to generate their own relevant module types
	 *
	 * @param {String} [name = null]
	 * @returns {DepNode}
	 */
	static create(name = null) {
		return new DepNode(name)
	}

	/**
	 * Creates a dependency graph from an array of items and their associated dependencies.
	 * ${itemsWithDeps} should be structured as follows:
	 * [
	 *   {
	 *     name: 'name',
	 *     dependencies: ['dependent-module-name', ...]
	 *   },
	 *   ...
	 * ]
	 *
	 * This method makes a shallow copy of ${itemsWithDeps} so as to not mutate the original
	 * array.
	 *
	 * @param {Array.<Object>} itemsWithDeps
	 * @returns {DepNode} - root node of a dependency tree built from ${itemsWithDeps}
	 */
	static createFromDepList(itemsWithDeps) {
		// Self points to the relevant calling class and is used to reference the correct
		// static create method. For example:
		//
		// DepNode.createFromDepList(...); self = DepNode
		// ModuleDepNode.createFromDepList(...); self = ModuleDepNode
		let self = this,
			root = self.create(),
			pool = itemsWithDeps.slice(0),
			nameNodeMap = new Map()

		/**
		 * Generator function that yields module names with no dependencies.
		 *
		 * @param {Array.<Object>} array
		 * @yields {Object} - generated value
		 */
		function *takeNextWithNoDeps(array) {
			let i = 0
			while (i < array.length) {
				let noDeps = array[i].dependencies.length === 0
				if (noDeps)
					yield array.splice(i, 1)[0]
				else
					// Not root
					i++
			}
		}

		/**
		 * @param {String} name
		 */
		function throwIfDuplicateName(name) {
			let isDuplicate = nameNodeMap.has(name)
			if (isDuplicate)
				throw new Error(`duplicate name: ${name}`)
		}

		/**
		 * @param {String} name
		 * @returns {DepNode}
		 */
		function createNode(name) {
			throwIfDuplicateName(name)
			let node = self.create(name)
			nameNodeMap.set(name, node)
			return node
		}

		/**
		 * @param {DepNode} node
		 * @param {DepNode} parentNode
		 */
		function linkKin(node, parentNode) {
			parentNode.children_.push(node)
			node.parents_.push(parentNode)
		}

		/**
		 * @param {Array.<Object>} array
		 * @returns {Object} - next module that has all dependency nodes in the graph
		 */
		function takeNext(array) {
			for (let i = 0, z = array.length; i < z; i++) {
				let itemDeps = array[i]
				if (allDepNodesCreated(itemDeps.dependencies))
					return array.splice(i, 1)[0]
			}

			return null
		}

		/**
		 * @param {Array.<String>} depNames
		 * @returns {Boolean} - true if nodes for all ${depNames} have been created; false otherwise
		 */
		function allDepNodesCreated(depNames) {
			return depNames.every((x) => nameNodeMap.has(x))
		}

		// Step 1: Create the "root" nodes (these are those immediately below the topmost true root
		// node)
		for (let x of takeNextWithNoDeps(pool)) {
			let subRootNode = createNode(x.name)
			linkKin(subRootNode, root)
		}

		// Step 2: Iteratively process all modules + dependencies that have all dependencies
		// satisfied
		for (let itemDeps; (itemDeps = takeNext(pool));) {
			throwIfDuplicateName(itemDeps.name)
			let node = createNode(itemDeps.name)
			itemDeps.dependencies.forEach((depName) => {
				if (depName === itemDeps.name) {
					throw new Error(`invalid dependencies for ${itemDeps.name}: an item may ` +
						'not depend on itself')
				}

				let parentNode = nameNodeMap.get(depName)
				linkKin(node, parentNode)
			})
		}

		// Step 3: ensure that there are no "orphan" nodes - dependencies that do not exist
		let hasOrphanNodes = pool.length > 0
		if (hasOrphanNodes) {
			let invalidNames = pool.map((x) => x.name).join(', ')
			throw new Error(`The following item names are invalid: ${invalidNames}`)
		}

		nameNodeMap.clear()

		return root
	}

	/**
	 * A DepNode may depend on multiple DepNodes - these are its parents. The reverse is also true,
	 * this DepNode may be required by multiple DepNodes.
	 *
	 * @constructor
	 * @param {String} [name = null] - name of this module
	 */
	constructor(name = null) {
		super()
		this.name_ = name
	}

	/**
	 * @param {DepNode} otherNode
	 * @returns {Boolean} - true if this node depends on ${otherNode} at any point in the graph; false otherwise
	 */
	dependsOn(otherNode) {
		if (this.parents_.includes(otherNode))
			return true

		return this.traverseParentsSome((node) => node.parents_.includes(otherNode))
	}

	/**
	 * @returns {String} - the name of the worker module
	 */
	name() {
		return this.name_
	}

	/**
	 * @returns {Map.<String,DepNode>}
	 */
	nameNodeMap() {
		let map = new Map()
		this.traverse((node) => map.set(node.name_, node))
		return map
	}
}
