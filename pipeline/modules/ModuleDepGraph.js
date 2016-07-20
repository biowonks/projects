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
			let node = this.nodeByName_(workerModule.module)
			node.setWorkerModule(workerModule)
		}
	}

	/**
	 * @param {String} moduleName
	 * @returns {Array.<String>} - the names of modules that must be completed before ${moduleName}
	 */
	missingDependencies(moduleName) {
		let resultSet = new Set(),
			node = this.nodeByName_(moduleName)
		node.traverseParents_((parentNode) => {
			let workerModule = parentNode.workerModule(),
				isIncomplete = !workerModule || workerModule.state === 'error'
			if (isIncomplete)
				resultSet.add(parentNode.name())
		})
		return Array.from(resultSet)
	}

	incompleteModules(moduleNames) {
		return this.toNodes_(moduleNames)
			.filter((node) => !node.workerModule() || node.workerModule().state === 'error')
			.map((node) => node.name())
	}

	/**
	 * @param {Array.<String>} moduleNames
	 * @returns {Array.<String>} - array of module names ordered with the most dependent modules occurring later
	 */
	orderByDepth(moduleNames) {
		return this.toNodes_(moduleNames)
			.sort((a, b) => a.depth() - b.depth())
			.map((node) => node.name())
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
