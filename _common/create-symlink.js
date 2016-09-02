#!/usr/bin/env node

// Inspired by:
// https://gist.github.com/branneman/8048520

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

let [,, sourcePath, destPath] = process.argv

if (!sourcePath) {
	// eslint-disable-next-line no-console
	console.error(`Usage: create-symlink.js <source path> [<dest path>]

  Cross-platform script for creating a symlink to <source path> at
  <dest path>. If <dest path> is excluded, uses the basename of
  <source path>. If on windows, requires administrator access or the
  relevant permissions to create a symlink`)

	process.exit(1)
}

if (!destPath)
	destPath = path.basename(sourcePath)

try {
	fs.unlinkSync(destPath)
}
catch (error) {
	// noop
}

fs.symlinkSync(sourcePath, destPath, 'dir')
