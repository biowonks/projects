'use strict'

// Local
const DepNode = require('mist-lib/graph/DepNode')

module.exports =
class ModuleDepNode extends DepNode {
	static create(name = null) {
		return new ModuleDepNode(name)
	}

	/**
	 * A module may depend on multiple modules - these are its parents. The reverse is also true,
	 * this module may be required by multiple modules.
	 *
	 * @param {String} [name = null] - name of this module
	 * @param {WorkerModule} [workerModule = null]
	 */
	constructor(name = null, workerModule = null) {
		super(name)
		this.workerModule_ = workerModule
	}

	setWorkerModule(newWorkerModule) {
		this.workerModule_ = newWorkerModule
		if (this.workerModule_ && this.name_ !== this.workerModule_.module) {
			throw new Error(`worker module name, ${this.workerModule_.module} does not match name ` +
				`given in the constructror: ${this.name_}`)
		}
	}

	workerModule() {
		return this.workerModule_
	}
}
