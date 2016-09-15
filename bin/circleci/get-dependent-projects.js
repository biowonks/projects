/* eslint-disable no-console */
'use strict'

// Core
const path = require('path')

// Local
const DepNode = require('../../mist-lib/src/graph/DepNode')

// Other
const kUsage = `Usage: get-dependent-projects.js <dependent project list> <changed project> [...]

  Given a list of projects that have changed and a list of inter-project
  dependencies, output all affected projects that should be rebuilt. For
  example, if core-lib has changed and mist-lib, mist-api, and mist-pipeline
  depend on core-lib, then all four will be listed as needing to be rebuilt.

  <dependent project list>: a javascript file that exports a list of project
  names and their dependencies. For example:

    module.exports = [
      {
        name: 'core-lib',
        dependencies: []
      },
      {
        name: 'seqdepot-lib',
        dependencies: ['core-lib']
      },
      ...
    ]

  <changed project>: maps to a name in the dependent project list or else it is
  ignored and will not be triggered for rebuilding.
`

// --------------------------------------------------------
let [,, depListFile, ...changedProjectNames] = process.argv
if (!depListFile || !changedProjectNames.length) {
	console.error(kUsage)
	process.exit(1)
}

// eslint-disable-next-line global-require, no-mixed-requires
let projectNamesWithDeps = require(path.resolve(depListFile)),
	root = DepNode.createFromDepList(projectNamesWithDeps),
	nameNodeMap = root.nameNodeMap(),
	affectedProjectNameSet = new Set()

changedProjectNames.forEach((projectName) => {
	let node = nameNodeMap.get(projectName)
	if (!node) {
		console.warn(`Skipping "${projectName}": missing from dependency list`)
		return
	}

	node.traverse((childNode) => {
		affectedProjectNameSet.add(childNode.name())
	})
})

let affectedProjectNames = Array.from(affectedProjectNameSet),
	affectedNodes = affectedProjectNames.map((name) => nameNodeMap.get(name))
affectedNodes.sort((a, b) => a.depth() - b.depth())
let result = affectedNodes.map((node) => node.name())
if (result.length)
	console.log(result.join('\n'))
