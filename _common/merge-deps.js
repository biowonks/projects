#!/usr/bin/env node

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

let overwriteDest = false // by default, do not overwrite <dest package.json>
let [,, inplaceOption, sourceFile, destFile] = process.argv

if (inplaceOption) {
	if (inplaceOption === '-i')
		overwriteDest = true
	else
		[sourceFile, destFile] = [inplaceOption, sourceFile]
}

if (!sourceFile || !destFile) {
	console.error(`Usage: merge-deps.js [-i] <source package.json> <dest package.json>

  This script copies "dependencies" and "devDependencies" values from
  <source package.json> and inserts them into <dest package.json>. If the same
  name exists in both files, the value from <source package.json> is used.

  Options:
    -i                 : overwrite dest package.json
`)

	process.exit(1)
}

let source = loadJson(path.resolve(sourceFile)),
	dest = loadJson(path.resolve(destFile))

copy(source, dest, 'dependencies')
copy(source, dest, 'devDependencies')

let result = JSON.stringify(dest, null, 2) + '\n'

if (overwriteDest)
	fs.writeFileSync(destFile, result)
else
	console.log(result)

// --------------------------------------------------------
// --------------------------------------------------------
function loadJson(file) {
	let result = null
	try {
		result = require(file)
	}
	catch (error) {
		console.error(`Unable to load/parse file: ${file}\n\n${error}`)
		process.exit(1)
	}
	return result
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
