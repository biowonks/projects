#!/usr/bin/env node

/* eslint-disable no-console */
'use strict'

// Local
let depMerge = require('../_common/dep-merge')

let overwriteDest = false, // by default, do not overwrite <dest package.json>
	args = process.argv.slice(2),
	destFile = args.pop()

if (args[0] === '-i') {
	args.shift()
	overwriteDest = true
}

let sourceFiles = args

if (!sourceFiles.length || !destFile) {
	console.error(`Usage: merge-deps.js [-i] <source package.json> [<package.json> ...] <dest package.json>

  This script copies "dependencies" and "devDependencies" values from
  <source package.json> and inserts them into <dest package.json>. If the same
  name exists in both files, the value from <source package.json> is used.

  Options:
    -i                 : overwrite dest package.json
`)

	process.exit(1)
}

sourceFiles.forEach((sourceFile) => {
	console.log(`Merging (dev)dependences from ${sourceFile} -> ${destFile}`)
	depMerge(sourceFile, destFile, {overwriteDest})
})
