'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Constants
const kJsonSpaces = 2

module.exports = function(sourceFile, destFile, options = {}) {
	if (!isFile(sourceFile))
		return ''

	if (!isFile(destFile)) {
		// eslint-disable-next-line no-console
		console.error(`${destFile} does not exist`)
		process.exit(1)
	}

	let source = loadJson(path.resolve(sourceFile)),
		dest = loadJson(path.resolve(destFile))

	copy(source, dest, 'dependencies')
	copy(source, dest, 'devDependencies')

	let result = JSON.stringify(dest, null, kJsonSpaces) + '\n'

	if (options.overwriteDest)
		fs.writeFileSync(destFile, result)

	return result
}

// --------------------------------------------------------
// --------------------------------------------------------
function isFile(file) {
	let stat = null
	try {
		stat = fs.statSync(file)
	}
	catch (error) {
		// Noop
		return false
	}
	return stat.isFile()
}

function loadJson(file) {
	let json = null
	try {
		json = require(file) // eslint-disable-line global-require
	}
	catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Unable to load/parse file: ${file}\n\n${error}`)
		process.exit(1)
	}
	return json
}

function copy(from, to, field) {
	let fromRef = from[field]
	if (!fromRef)
		return

	if (!to[field])
		to[field] = {}

	let toRef = to[field]

	for (let key in fromRef)
		toRef[key] = fromRef[key]
}
