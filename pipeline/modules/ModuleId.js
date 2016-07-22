'use strict'

module.exports =
class ModuleId {
	constructor(name, subNames = []) {
		this.name_ = name
		this.subNames_ = subNames
	}

	name() {
		return this.name_
	}

	subNames() {
		return this.subNames_
	}

	unnest() {
		if (!this.subNames_.length)
			return [new ModuleId(this.name_, this.subNames_)]

		return this.subNames_.map((subName) => {
			return new ModuleId(this.name_, [subName])
		})
	}

	toString() {
		let result = this.name_
		if (this.subNames_.length)
			result += ':' + this.subNames_.join('+')
		return result
	}

	static fromString(moduleIdString) {
		let matches = /^([A-Za-z]\w*)(?::(\S+))?$/.exec(moduleIdString)

		if (!matches)
			throw new Error(`invalid input module name: ${moduleIdString.toString()}`)

		let name = matches[1],
			subNames = matches[2] ? matches[2].split('+') : []
		for (let subName of subNames) {
			if (isInvalidModuleName(subName))
				throw new Error(`invalid input submodule name: ${subName}`)
		}

		return new ModuleId(name, subNames)
	}

	static fromStrings(moduleIdStrings) {
		return moduleIdStrings.map(ModuleId.fromString)
	}

	static unnest(moduleIds) {
		let result = []

		moduleIds.forEach((moduleId) => {
			result.push(...moduleId.unnest())
		})

		return result
	}

	/**
	 * Group moduleIds with the same name by combining their subNames
	 * @param {Array.<ModuleId>} moduleIds
	 * @returns {Array.<ModuleId>} moduleIds
	 */
	static nest(moduleIds) {
		let result = [],
			map = new Map()

		moduleIds.forEach((moduleId) => {
			let entry = map.get(moduleId.name())
			if (entry) {
				entry.subNames_.push(...moduleId.subNames_)
				return
			}

			result.push(moduleId)
			map.set(moduleId.name(), moduleId)
		})

		return result
	}
}

function isInvalidModuleName(name) {
	return !/^[A-Za-z]\w*$/.test(name)
}
