/**
 * A collection of pipeline utility methods.
 */
'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Local
const OncePipelineModule = require('./OncePipelineModule'),
	PerGenomePipelineModule = require('./PerGenomePipelineModule'),
	ModuleId = require('./ModuleId')

// Constants
const kHelpIndent1 = '     ',
	kHelpIndent2 = '       '

/**
 * -------------------------------------------------------------------------------------------------
 * @param {Array.<Function>} ModuleClasses - array of module class definitions
 * @returns {String} - help text for all ${ModuleClasses}
 */
exports.modulesHelp = function(ModuleClasses) {
	if (!ModuleClasses.length)
		return kHelpIndent1 + '[none]'

	return ModuleClasses.map(exports.moduleHelp).join('\n')
}

/**
 * @param {Function} ModuleClass - module class definitions
 * @returns {String} - help text for using this module
 */
exports.moduleHelp = function(ModuleClass) {
	let description = ModuleClass.description(),
		subModuleMap = ModuleClass.subModuleMap(),
		moreInfo = ModuleClass.moreInfo(),
		help = kHelpIndent1 + ModuleClass.name

	if (subModuleMap.size) {
		help += ':<sub module>[+...]\n'
		if (description)
			help += kHelpIndent2 + description + '\n'
		help += kHelpIndent2 + 'sub-modules:\n\n'
		for (let subModuleName of subModuleMap.keys()) {
			let subDescription = subModuleMap.get(subModuleName)
			help += kHelpIndent2 + `* ${subModuleName}` + (subDescription ? ` - ${subDescription}` : '') + '\n'
		}
	}
	else if (description) {
		help += ' - ' + description
	}

	if (moreInfo) {
		help += '\n'
		help += kHelpIndent2 + moreInfo.split('\n').join('\n' + kHelpIndent2) + '\n'
	}

	return help
}

/**
 * -------------------------------------------------------------------------------------------------
 * @param {...String} srcPaths - an array of paths to search for compatible pipeline modules
 * @returns {Object.<String,Array.<AbstractPipelineModule>>} - object with three keys: 'once', 'perGenome', and 'all'; which contain 'once', 'per-genome', and all pipeline modules, respectively.
 */
exports.enumerateModules = function(...srcPaths) {
	let result = {
		once: [],
		perGenome: [],
		all: null
	}

	srcPaths.forEach((srcPath) => {
		getModuleRootFiles(srcPath)
		.forEach((moduleRootFile) => {
			try {
				// eslint-disable-next-line global-require
				let ModuleClass = require(`${srcPath}/${moduleRootFile}`)
				if (ModuleClass.prototype instanceof OncePipelineModule)
					result.once.push(ModuleClass)
				else if (ModuleClass.prototype instanceof PerGenomePipelineModule)
					result.perGenome.push(ModuleClass)
			}
			catch (error) {
				if (!error.code)
					throw error
				else if (error.code === 'MODULE_NOT_FOUND')
					// eslint-disable-next-line no-console
					console.warn(`WARNING: File could not be loaded: ${srcPath}/${moduleRootFile}\n\n`, error)
			}
		})
	})

	result.all = [...result.once, ...result.perGenome]

	return result
}

/**
 * @param {String} srcPath
 * @returns {Array.<String>} - all directories or files ending in .js beneath ${srcPath}
 */
function getModuleRootFiles(srcPath) {
	return fs.readdirSync(srcPath)
	.filter((file) => {
		let stat = fs.statSync(path.join(srcPath, file))
		return stat.isDirectory() || (stat.isFile && file.endsWith('.js'))
	})
}

/**
 * -------------------------------------------------------------------------------------------------
 * @param {Array.<ModuleId>} moduleIds - array of parsed module names and any submodules
 * @param {Array.<Function>} ModuleClasses - array of module class definitions
 * @returns {Array.<ModuleId>} - array of qualified module names that do not have a cognate ModuleClass or submodule
 */
exports.findInvalidModuleIds = function(moduleIds, ModuleClasses) {
	let map = exports.mapModuleClassesByName(ModuleClasses),
		result = []

	ModuleId.unnest(moduleIds).forEach((moduleId) => {
		let ModuleClass = map.get(moduleId.name())
		if (!ModuleClass) {
			result.push(moduleId)
			return
		}

		let hasSubModules = ModuleClass.subModuleMap().size > 0,
			subName = moduleId.subNames()[0]
		if ((hasSubModules && !subName) || (subName && !ModuleClass.subModuleMap().has(subName)))
			result.push(moduleId)
	})

	return result
}

/**
 * -------------------------------------------------------------------------------------------------
 * @param {Array.<ModuleId>} moduleIds
 * @param {Array.<AbstractPipelineModule>} ModuleClasses
 * @returns {Array.<ModuleId>} - those module ids that match a class in ${ModuleClasses}
 */
exports.matchingModuleIds = function(moduleIds, ModuleClasses) {
	let map = exports.mapModuleClassesByName(ModuleClasses)
	return moduleIds.filter((x) => map.has(x.name()))
}

/**
 * -------------------------------------------------------------------------------------------------
 * Returns an array of objects containing the name of this module and its dependencies as specified
 * by the ModuleClass's static dependencies() method. If a ModuleClass has one or more submodules,
 * then an entry is created for each submodule. For example,
 *
 * Core.dependencies() -> []
 * Core.subModuleNames() -> []
 * AseqCompute.dependencies() -> ['Core']
 * AseqCompute.subModuleNames() -> ['pfam30', 'segs', 'coils']
 *
 * flatDependencyArray([Core, AseqCompute]) returns:
 * [
 *   {
 *     name: 'Core',
 *     dependencies: []
 *   },
 *   {
 *     name: 'AseqCompute:pfam30',
 *     dependencies: ['Core']
 *   },
 *   {
 *     name: 'AseqCompute:segs',
 *     dependencies: ['Core']
 *   },
 *   {
 *     name: 'AseqCompute:coils',
 *     dependencies: ['Core']
 *   }
 * ]
 *
 * This facilitates producing a dependency tree via ModuleDepNode.createFromDepList().
 *
 * @param {Array.<Function>} ModuleClasses - array of module class definitions
 * @returns {Array.<Object>} - array of "flattened" dependencies
 */
exports.unnestedDependencyArray = function(ModuleClasses) {
	let result = []

	ModuleClasses.forEach((ModuleClass) => {
		let subModuleNames = Array.from(ModuleClass.subModuleMap().keys())
		if (subModuleNames.length) {
			subModuleNames.forEach((subModuleName) => {
				result.push({
					name: `${ModuleClass.name}:${subModuleName}`,
					dependencies: ModuleClass.dependencies()
				})
			})
		}
		else {
			result.push({
				name: ModuleClass.name,
				dependencies: ModuleClass.dependencies()
			})
		}
	})

	return result
}

/**
 * -------------------------------------------------------------------------------------------------
 * @param {Array.<Function>} ModuleClasses - array of module class definitions
 * @returns {Map.<String,Function>}
 */
exports.mapModuleClassesByName = function(ModuleClasses) {
	return new Map(ModuleClasses.map((x) => [x.name, x]))
}
