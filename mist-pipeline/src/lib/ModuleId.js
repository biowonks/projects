'use strict'

module.exports =
class ModuleId {
	/**
	 * Identifies a given module and zero or more submodules. Useful for representing a standalone
	 * module and/or any subset of a module's submodules.
	 *
	 * @param {String} name - primary module name
	 * @param {Array.<String>} [subNames=[]] - one or more names that identify submodules
	 * @constructor
	 */
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

	/**
	 * Expands this module id into an array of ModuleIds with one ModuleId per subname or a copy
	 * of this ModuleId if there are no subNames.
	 *
	 * @returns {Array.<ModuleId>}
	 */
	unnest() {
		if (!this.subNames_.length)
			return [new ModuleId(this.name_, this.subNames_)]

		return this.subNames_.map((subName) => {
			return new ModuleId(this.name_, [subName])
		})
	}

	/**
	 * The inverse of fromString(). Serializes the name and subNames into a string.
	 * For example:
	 *
	 * toString(ModuleId('NCBICoreData') -> 'NCBICoreData'
	 * toString(ModuleId('AseqCompute', ['segs', 'coils']) -> 'AseqCompute:segs+coils'
	 *
	 * @returns {String}
	 */
	toString() {
		let result = this.name_
		if (this.subNames_.length)
			result += ':' + this.subNames_.join('+')
		return result
	}

	/**
	 * The inverse of toString(). Decodes the serialized representation of a module id
	 * (${moduleIdString}) into a ModuleId instance. For example,
	 *
	 * fromString('SeedNewGenomes') -> ModuleId('SeedNewGenomes')
	 * fromString('AseqCompute:pfam30+segs') -> ModuleId('AseqCompute', ['pfam30', 'segs'])
	 *
	 * @param {String} moduleIdString
	 * @returns {ModuleId}
	 */
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

	/**
	 * Convenience method for mapping an array of serialized ${moduleIdStrings} into an array of
	 * ModuleIds.
	 *
	 * @param {Array.<String>} moduleIdStrings
	 * @returns {Array.<ModuleId>}
	 */
	static fromStrings(moduleIdStrings) {
		return moduleIdStrings.map(ModuleId.fromString)
	}

	/**
	 * Expands an array of ${moduleIds} into an array of "flat" ModuleIds that have no more than one
	 * subName each (if any). Simply combines the results of calling unnest on each ModuleId in
	 * ${moduleIds}.
	 *
	 * @param {Array.<ModuleId>} moduleIds
	 * @returns {Array.<ModuleId>}
	 */
	static unnest(moduleIds) {
		let result = []

		moduleIds.forEach((moduleId) => {
			result.push(...moduleId.unnest())
		})

		return result
	}

	/**
	 * The inverse of unnest. Groups ${moduleIds} that have the same name into a single ModuleId
	 * instance and concatenates all the subNames.
	 *
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

/**
 * Module and submodule names must begin with a letter and consist entirely of word characters.
 *
 * @param {String} name
 * @returns {Boolean} - true if name is valid; false otherwise
 */
function isInvalidModuleName(name) {
	return !/^[A-Za-z]\w*$/.test(name)
}
