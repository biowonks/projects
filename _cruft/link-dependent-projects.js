#!/usr/bin/env node

/* eslint-disable no-console */
'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Local
const depMerge = require('../_common/dep-merge')

// Constants
const kRootDir = path.resolve(__dirname, '..'),
	kDependentProjectFileName = 'dependent.projects.js'

// --------------------------------------------------------
let [,, rootProjectName] = process.argv
if (!rootProjectName) {
	// eslint-disable-next-line no-console
	console.error(`Usage: link-dependent-projects.js <project name>

  <project name> should refer to a top-level directory that corresponds to a
  biowonks project. Special exceptions include any folder beginning with an
  underscore (_) or the bin folder.

  This script does the following:
  1) Recurses through all dependent projects (by looking at the contents of
     each <project name>/dependent.projects.js file) and builds a complete
     list of unique dependent project names.

  2) Merges the package dependencies of each dependent project
`)

//   3) Creates relevant symlinks in the src/node_modules directory for each
//      dependent project

	process.exit(1)
}

if (isInvalidProjectName(rootProjectName)) {
	console.error(`${rootProjectName} is not a valid project name`)
	process.exit(1)
}

let depProjectNames = getUniqueDependentProjectNames(rootProjectName)
mergePackageDependencies(rootProjectName, depProjectNames)
// createSymlinks(rootProjectName, depProjectNames)

// --------------------------------------------------------
function isInvalidProjectName(projectName) {
	return projectName[0] === '_' ||
		projectName === 'bin' ||
		!/^[A-Za-z0-9.\-_/]+$/.test(projectName) ||
		!/^\w/.test(projectName) ||
		!/\w$/.test(projectName)
}

function getUniqueDependentProjectNames(projectName) {
	let directory = path.resolve(kRootDir, projectName),
		result = []
	if (!isDirectory(directory)) {
		console.error(`>> ${projectName} << is not a valid project directory (or subdirectory)`)
		process.exit(1)
	}

	let dependentProjectNames = null,
		dependentProjectFile = path.resolve(directory, kDependentProjectFileName)
	try {
		// eslint-disable-next-line global-require
		dependentProjectNames = require(dependentProjectFile)
	}
	catch (error) {
		if (error.code !== 'MODULE_NOT_FOUND')
			throw error
	}

	if (!dependentProjectNames)
		return result

	if (!Array.isArray(dependentProjectNames))
		throw new Error(`${dependentProjectFile} did not export an array`)

	dependentProjectNames.forEach((fileName) => {
		if (typeof fileName !== 'string')
			throw new Error(`${dependentProjectFile} must only contain string values`)
	})

	dependentProjectNames = dependentProjectNames
		.map((x) => x.trim())
		.filter((x) => !!x)

	result = [...result, ...dependentProjectNames]

	dependentProjectNames.forEach((dependentProjectName) => {
		if (isInvalidProjectName(dependentProjectName))
			throw new Error(`${dependentProjectName} is not a valid project name (source: ${projectName}/${kDependentProjectFileName})`)

		let subResult = getUniqueDependentProjectNames(dependentProjectName)
		result = [...result, ...subResult]
	})

	let set = new Set(result)

	return Array.from(set)
}

/**
 * @param {String} directory
 * @returns {Boolean} - true if ${directory} exists and is a directory; false otherwise
 */
function isDirectory(directory) {
	let stat = null
	try {
		stat = fs.statSync(directory)
	}
	catch (error) {
		// Noop
		return false
	}
	return stat.isDirectory()
}

function mergePackageDependencies(projectName, depProjectNamePaths) {
	let destPackageJson = path.resolve(kRootDir, projectName, 'package.json')

	depProjectNamePaths.forEach((depProjectNamePath) => {
		let sourcePackageJson = path.resolve(kRootDir, depProjectNamePath, 'package.json')
		console.log(`Merging ${depProjectNamePath}/package.json --> ${projectName}/package.json`)
		depMerge(sourcePackageJson, destPackageJson, {overwriteDest: true})
	})
}

// function createSymlinks(projectName, depProjectNamePaths) {
// 	let targetDirectory = path.resolve(kRootDir, projectName, 'src', 'node_modules')
// 	depProjectNamePaths.forEach((depProjectNamePath) => {
// 		let sourcePath = path.resolve(kRootDir, depProjectNamePath, 'src'),
// 			destPath = path.resolve(targetDirectory, depProjectNamePath),
// 			containsSrc = /\/src\//.test(depProjectNamePath)

// 		if (containsSrc) {

// 		}

// 		console.log(`Creating symlink ${projectName}/src/node_modules/${depProjectNamePath.replace('/src', '')} --> ${depProjectNamePath}`)
// 		symlink(sourcePath, destPath)
// 	})
// }

// function symlink(sourcePath, destPath) {
// 	if (!destPath)
// 		destPath = path.basename(sourcePath) // eslint-disable-line no-param-reassign

// 	try {
// 		fs.unlinkSync(destPath)
// 	}
// 	catch (error) {
// 		// noop
// 	}

// 	fs.symlinkSync(sourcePath, destPath, 'dir')
// }
