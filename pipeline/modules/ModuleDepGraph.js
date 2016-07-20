'use strict'

module.exports =
class ModuleDepGraph {
	/**
	 * @param {ModuleDepNode} rootNode
	 */
	constructor(rootNode) {
		this.root_ = rootNode
		this.nameNodeMap_ = rootNode.nameNodeMap()
	}

	/**
	 * Sets the worker modules for all the nodes contained by ${rootNode}. If duplicate worker
	 * module names are present, the last one takes precedence.
	 *
	 * Throws an error if a ModuleDepNode is not found for a given workerModule (which is determined
	 * by comparing the WorkerModule's name to the ModuleDepNode's name).
	 *
	 * @param {Array.<WorkerModule>} workerModules
	 */
	loadState(workerModules) {
		this.clearWorkerModules_()
		for (let workerModule of workerModules) {
			let node = this.nodeByName_(workerModule.name())
			node.setWorkerModule(workerModule)
		}
	}

	/**
	 * @param {Array.<String>} moduleNames
	 * @returns {Array.<String>} - the names of modules (not including {$moduleNames}) that must be completed before ${moduleNames} prior to ${moduleNames}
	 */
	missingDependencies(moduleNames) {
		let resultSet = new Set(),
			moduleNamesSet = new Set(moduleNames),
			nodes = this.toNodes_(moduleNames)
		for (let node of nodes) {
			this.traverseParents_(node, (parentNode) => {
				let workerModule = parentNode.workerModule(),
					isIncomplete = !moduleNamesSet.has(parentNode.name()) && (!workerModule || workerModule.state === 'error')
				if (isIncomplete)
					resultSet.add(parentNode.name())
			})
		}
		return Array.from(resultSet)
	}

	/**
	 * Every parent node has to have an associated worker module
	 * @param {String} moduleName
	 * @returns {Boolean}
	 */
	allDependenciesDone(moduleName) {
		let node = this.nodeByName_(moduleName)
		return node.traverseParentsEvery((parentNode) => {
			let workerModule = parentNode.workerModule()
			return !!workerModule && workerModule.state === 'done'
		})
	}

	/**
	 * @param {Array.<String>} moduleNames
	 * @returns {Array.<String>} - array of module names ordered with the most dependent modules occurring later
	 */
	orderByDependencies(moduleNames) {
		let depNodes = moduleNames.map((x) => this.nodeByName_(x))
		depNodes.sort((a, b) => {
			// First, by those that all dependencies done
			// let aAllDone = this.allDependenciesDone(a.name()),
			// 	bAllDone = this.allDependenciesDone(b.name())

			return false

			// if (aAllDone && bAllDone) {

			// }
		})
		return depNodes.map((x) => x.name())
	}

	// ----------------------------------------------------
	// Private methods
	clearWorkerModules_() {
		for (let node of this.nameNodeMap_.values())
			node.setWorkerModule(null)
	}

	nodeByName_(moduleName) {
		let node = this.nameNodeMap_.get(moduleName)
		if (!node)
			throw new Error(`worker module, ${moduleName}, not found in dependency graph`)
		return node
	}

	toNodes_(moduleNames) {
		return moduleNames.map((x) => this.nodeByName_(x))
	}
}
