'use strict'

// Local
let arrayUtil = require('core-lib/array-util')
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
	 * Nulls the workerModules of nodes identified by ${workerModules}
	 *
	 * @param {Array.<WorkerModule>} workerModules
	 */
	removeState(workerModules) {
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
			node.setWorkerModule(null)
		}
	}

	/**
	 * @param {...String} states - list of WorkerModule states to search dependency graph for
	 * @returns {Array.<ModuleId>} - array of nested ModuleIds
	 */
	moduleIdsInStates(...states) {
		let queryStates = new Set(states),
			result = []
		this.root_.traverse((node) => {
			let workerModule = node.workerModule()
			if (workerModule && queryStates.has(workerModule.state))
				result.push(ModuleId.fromString(node.name()))
		})
		return ModuleId.nest(result)
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
	 * This method helps determine if ${moduleId} may be undone. If this method returns an empty
	 * array, then ${moduleId} may be undone; however, if a downstream node depends on ${moduleId}
	 * then they may not be undone.
	 *
	 * @param {ModuleId} moduleId
	 * @returns {Array.<ModuleId>} - deeper module ids that depend on ${moduleIds}
	 */
	moduleIdsDependingOn(moduleId) {
		let node = this.nodeByName_(moduleId.toString()),
			moduleIdStrings = new Set()
		node.traverse((childNode) => {
			if (childNode === node)
				return

			let workerModule = childNode.workerModule()
			if (workerModule && workerModule.state === 'done')
				moduleIdStrings.add(childNode.name())
		})
		return ModuleId.fromStrings(Array.from(moduleIdStrings))
	}

	/**
	 * "done" modules are those identified by ${moduleIds} that have a worker module with a state of
	 * done.
	 *
	 * @param {Array.<ModuleId>} moduleIds
	 * @returns {Array.<ModuleId>}
	 */
	doneModuleIds(moduleIds) {
		return this.matchingModuleIds(moduleIds, (node) => {
			return node.workerModule() && node.workerModule().state === 'done'
		})
	}

	/**
	 * @param {Array.<ModuleId>} moduleIds
	 * @param {Function} nodeFilterFn - filter function that receives a single argument, a ModuleDepNode, and must return true to match this node or false otherwise.
	 * @returns {Array.<ModuleId>}
	 */
	matchingModuleIds(moduleIds, nodeFilterFn) {
		return this.toNodes(moduleIds)
			.filter(nodeFilterFn)
			.map((node) => ModuleId.fromString(node.name()))
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
	 * @param {Boolean} [sortDesc=false] sort in descending order
	 * @returns {Array.<ModuleId>} - array of module names ordered with the most dependent modules occurring later
	 */
	orderByDepth(moduleIds, sortDesc = false) {
		function sortAscFn(a, b) {
			return a.depth() - b.depth()
		}

		function sortDescFn(a, b) {
			return b.depth() - a.depth()
		}

		let sortFn = !sortDesc ? sortAscFn : sortDescFn

		return this.toNodes(moduleIds)
			.sort(sortFn)
			.map((node) => ModuleId.fromString(node.name()))
	}

	reverseOrderByDepth(moduleIds) {
		return this.orderByDepth(moduleIds, true)
	}

	/**
	 * @param {Array.<ModuleId>} moduleIds array of unnested module ids
	 * @returns {Array.<ModuleId>} array of nested module ids sorted by depth and then nested at each depth level
	 */
	orderAndNestByDepth(moduleIds) {
		// Nest nodes with the same name at the same depth
		const nodesByDepth = {}
		this.toNodes(moduleIds)
			.forEach((node) => {
				const depth = node.depth()
				if (!nodesByDepth[depth])
					nodesByDepth[depth] = []
				const moduleId = ModuleId.fromString(node.name())
				nodesByDepth[depth].push(moduleId)
			})

		const nestedAtDepth = Object.keys(nodesByDepth)
			.sort((a, b) => a - b)
			.map((depth) => ModuleId.nest(nodesByDepth[depth]))

		return arrayUtil.flatten(nestedAtDepth)
	}

	/**
	 * @param {Array.<ModuleId>} moduleIds
	 * @returns {Array.<ModuleDepNode>}
	 */
	toNodes(moduleIds) {
		return moduleIds.map((x) => this.nodeByName_(x.toString()))
	}

	// ----------------------------------------------------
	// Private methods
	clearWorkerModules_() {
		for (let node of this.nameNodeMap_.values())
			node.setWorkerModule(null)
	}

	/**
	 * @param {String} moduleName
	 * @returns {ModuleDepNode}
	 */
	nodeByName_(moduleName) {
		let node = this.nameNodeMap_.get(moduleName)
		if (!node)
			throw new Error(`worker module, ${moduleName}, not found in dependency graph`)
		return node
	}
}
