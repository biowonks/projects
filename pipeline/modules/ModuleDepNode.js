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

		function *takeSubRoots(array) {
			let i = 0
			while (i < array.length) {
				let isRoot = array[i].deps.length === 0
				if (isRoot)
					yield array.splice(i, 1)[0]
				else
					// Not root
					i++
			}
		}

		function throwIfDuplicate(name) {
			let isDuplicate = nameNodeMap.has(name)
			if (isDuplicate)
				throw new Error(`duplicate module name: ${name}`)
		}

		function createNode(name) {
			throwIfDuplicate(name)
			let node = new ModuleDepNode(name)
			nameNodeMap.set(name, node)
			return node
		}

		/**
		 * node dependsOn parentNode
		 */
		function linkKin(node, parentNode) {
			parentNode.children_.push(node)
			node.parents_.push(parentNode)
		}

		for (let x of takeSubRoots(pool)) {
			let subRootNode = createNode(x.name)
			linkKin(subRootNode, root)
		}

		function takeNext(array) {
			for (let i = 0, z = array.length; i < z; i++) {
				let moduleDeps = array[i]
				if (allDepNodesCreated(moduleDeps.deps))
					return array.splice(i, 1)[0]
			}

			return null
		}

		function allDepNodesCreated(deps) {
			return deps.every((x) => nameNodeMap.has(x))
		}

		for (let moduleDeps; (moduleDeps = takeNext(pool));) {
			throwIfDuplicate(moduleDeps.name)
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

		let hasOrphanNodes = pool.length > 0
		if (hasOrphanNodes) {
			let invalidNames = pool.map((x) => x.name).join(', ')
			throw new Error(`The following module names are invalid: ${invalidNames}`)
		}

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
	 * @returns {String} - the name of the worker module
	 */
	name() {
		return this.name_
	}

	/**
	 * @returns {Set}
	 */
	parents() {
		return this.parents_
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
}
