'use strict'

// Local
let ModuleId = require('./ModuleId')

module.exports =
class ModuleDepGraph {
	/**
	 * @param {ModuleDepNode} rootNode
	 * @param {Object} [logger=null]
	 * @constructor
	 */
	constructor(rootNode, logger = null) {
		this.root_ = rootNode
		this.logger_ = logger
		this.nameNodeMap_ = rootNode.nameNodeMap()
	}

	/**
	 * Removes all associated worker module nodes in the graph and then assigns those in
	 * ${workerModules}.
	 *
	 * @param {Array.<WorkerModule>} workerModules
	 */
	loadState(workerModules) {
		this.clearWorkerModules_()
		this.updateState(workerModules)
	}

	/**
	 * Sets the worker module for each matching ModuleDepNode. If duplicate worker module names are
	 * present, the last one takes precedence.
	 *
	 * If no logger is defined (via the constructor), this method throws an error if a ModuleDepNode
	 * is not found for a given workerModule (which is determined by comparing the WorkerModule's
	 * name to the ModuleDepNode's name); otherwise, the mismatch is logged.
	 *
	 * @param {Array.<WorkerModule>} workerModules
	 */
	updateState(workerModules) {
		for (let workerModule of workerModules) {
			let node = null
			try {
				node = this.nodeByName_(workerModule.module)
			}
			catch (error) {
				if (this.logger_)
					this.logger_.warn(`Database worker module, ${workerModule.module}, could not be found in the dependency graph. Ignoring...`)
				else
					throw error
				continue
			}
			node.setWorkerModule(workerModule)
		}
	}

	/**
	 * All parent modules that have not yet been computed or whose state is error.
	 *
	 * @param {ModuleId} moduleId
	 * @returns {Array.<String>} - the names of modules that must be completed before ${moduleName}
	 */
	missingDependencies(moduleId) {
		let resultSet = new Set(),
			node = this.nodeByName_(moduleId.toString())
		node.traverseParents((parentNode) => {
			// Ignore the top-most root node
			if (parentNode.parents().length === 0)
				return

			let workerModule = parentNode.workerModule(),
				isIncomplete = !workerModule || workerModule.state === 'error'
			if (isIncomplete)
				resultSet.add(parentNode.name())
		})
		return Array.from(resultSet)
	}

	/**
	 * "incomplete" modules are those that either do not have an associated worker module or if
	 * the worker module state is in error.
	 *
	 * @param {Array.<ModuleId>} moduleIds
	 * @returns {Array.<ModuleId>}
	 */
	incompleteModuleIds(moduleIds) {
		return this.toNodes(moduleIds)
			.filter((node) => !node.workerModule() || node.workerModule().state === 'error')
			.map((node) => ModuleId.fromString(node.name()))
	}

	/**
	 * @param {Array.<ModuleId>} moduleIds
	 * @returns {Array.<String>} - array of module names ordered with the most dependent modules occurring later
	 */
	orderByDepth(moduleIds) {
		return this.toNodes(moduleIds)
			.sort((a, b) => a.depth() - b.depth())
			.map((node) => ModuleId.fromString(node.name()))
	}

	toNodes(moduleIds) {
		return moduleIds.map((x) => this.nodeByName_(x.toString()))
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
}
