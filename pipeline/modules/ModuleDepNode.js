'use strict'

module.exports =
class ModuleDepNode {
	/**
	 * Creates a dependency graph from an array of module names with their associated dependencies.
	 * ${moduleNamesWithDeps} should be structured as follows:
	 * [
	 *   {
	 *     name: 'name-of-module',
	 *     deps: ['dependent-module-name', ...]
	 *   },
	 *   ...
	 * ]
	 *
	 * This method makes a shallow copy of ${moduleNamesWithDeps} so as to not mutate the original
	 * array.
	 *
	 * @param {Array.<Object>} moduleNamesWithDeps
	 * @returns {ModuleDepNode} - root node of a dependency tree built from ${moduleNamesWithDeps}
	 */
	static createFromDepList(moduleNamesWithDeps) {
		let root = new ModuleDepNode(),
			pool = moduleNamesWithDeps.slice(0),
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
				let noDeps = array[i].deps.length === 0
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
				throw new Error(`duplicate module name: ${name}`)
		}

		/**
		 * @param {String} name
		 * @returns {ModuleDepNode}
		 */
		function createNode(name) {
			throwIfDuplicateName(name)
			let node = new ModuleDepNode(name)
			nameNodeMap.set(name, node)
			return node
		}

		/**
		 * @param {ModuleDepNode} node
		 * @param {ModuleDepNode} parentNode
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
				let moduleDeps = array[i]
				if (allDepNodesCreated(moduleDeps.deps))
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
		for (let moduleDeps; (moduleDeps = takeNext(pool));) {
			throwIfDuplicateName(moduleDeps.name)
			let node = createNode(moduleDeps.name)
			moduleDeps.deps.forEach((depName) => {
				if (depName === moduleDeps.name) {
					throw new Error(`invalid dependencies for ${moduleDeps.name}: a module may ` +
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
			throw new Error(`The following module names are invalid: ${invalidNames}`)
		}

		nameNodeMap.clear()

		return root
	}

	/**
	 * A module may depend on multiple modules - these are its parents. The reverse is also true,
	 * this module may be required by multiple modules. Thus, there may be 0..n parents and 0..m
	 * children.
	 *
	 * @param {String} [name = null] - name of this module
	 * @param {WorkerModule} [workerModule = null]
	 */
	constructor(name = null, workerModule = null) {
		this.name_ = name
		this.workerModule_ = workerModule
		this.parents_ = []
		this.children_ = []
	}

	/**
	 * @returns {Set}
	 */
	children() {
		return this.children_
	}

	/**
	 * @param {ModuleDepNode} otherNode
	 * @returns {Boolean} - true if this node depends on ${otherNode} at any point in the graph; false otherwise
	 */
	dependsOn(otherNode) {
		if (this.parents_.indexOf(otherNode) >= 0)
			return true

		for (let parentNode of this.parents_) {
			if (parentNode.dependsOn(otherNode))
				return true
		}

		return false
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
	 * @returns {String} - the name of the worker module
	 */
	name() {
		return this.name_
	}

	nameNodeMap() {
		let map = new Map()
		this.recurseBuildNameNodeMap_(this, map)
		return map
	}

	/**
	 * @returns {Set}
	 */
	parents() {
		return this.parents_
	}

	/**
	 * Traverses the parents of node in reverse depth-first order. Excludes the top-most root node
	 * (node without any parents).
	 *
	 * @param {Function} callbackFn - callback function to execute when visiting each parentNode
	 */
	traverseParents(callbackFn) {
		for (let parentNode of this.parents_) {
			if (parentNode.parents_.length > 0) {
				callbackFn(parentNode)
				parentNode.traverseParents(callbackFn)
			}
		}
	}

	traverseParentsEvery(conditionFn) {
		for (let parentNode of this.parents_) {
			if (parentNode.parents_.length > 0)
				return conditionFn(parentNode) ? parentNode.traverseParentsEvery(conditionFn) : false
		}

		return true
	}

	traverseParentsSome(conditionFn) {
		for (let parentNode of this.parents_) {
			if (parentNode.parents_.length > 0)
				return conditionFn(parentNode) ? true : parentNode.traverseParentsSome(conditionFn)
		}

		return false
	}

	setWorkerModule(newWorkerModule) {
		this.workerModule_ = newWorkerModule
		if (this.workerModule_ && this.name_ !== this.workerModule_.name) {
			throw new Error(`worker module name, ${this.workerModule_.name} does not match name ` +
				`given in the constructror: ${this.name_}`)
		}
	}

	workerModule() {
		return this.workerModule_
	}

	// ----------------------------------------------------
	// Private methods
	recurseBuildNameNodeMap_(node, map) {
		map.set(node.name_, node)
		for (let child of node.children_)
			this.recurseBuildNameNodeMap_(child, map)
	}
}
