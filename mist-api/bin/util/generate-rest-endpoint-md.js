/* eslint-disable no-console, global-require , no-mixed-requires*/

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const HTTPSnippet = require('httpsnippet')

// Local
const config = require('../../config')

let [,, routesDir, ...targets] = process.argv
if (!routesDir || !targets.length) {
	console.error('Usage: generate-rest-endpoint-md.js <routes directory> <target> [...]\n')
	process.exit(1)
}

routesDir = path.resolve(routesDir)

let languageMap = {
	shell: 'bash',
	node: 'javascript'
}

traverseDirectory(routesDir, (listing) => {
	let mdFileNames = listing.files.filter((x) => x.endsWith('.md')),
		jsFileNameSet = new Set(listing.files.filter((x) => x.endsWith('.js'))),
		subEndpoint = subEndpointFromDirectory(listing.directory),
		url = config.server.baseUrl + subEndpoint

	url = url.replace('127.0.0.1', 'localhost')

	mdFileNames.forEach((mdFileName) => {
		let mdFile = path.resolve(listing.directory, mdFileName),
			md = fs.readFileSync(mdFile, {encoding: 'utf8'}),
			mdParts = splitMd(md),
			baseName = path.basename(mdFile, '.md'),
			jsFileName = baseName + '.js'

		console.log(mdParts.header)
		console.error(mdParts)

		// Attempt to create any snippets if relevant
		if (jsFileNameSet.has(jsFileName)) {
			let jsFile = path.resolve(listing.directory, jsFileName),
				handler = require(jsFile)
			if (handler.har) {
				let snippet = new HTTPSnippet({
					method: methodFromName(jsFileName),
					url
				})

				targets.forEach((target) => {
					let effectiveTarget = target,
						subTarget = null
					if (target.includes(':')) {
						let parts = target.split(':')
						effectiveTarget = parts[0]
						subTarget = parts[1]
					}

					console.log('```' + (languageMap[effectiveTarget] || effectiveTarget))
					console.log(snippet.convert(effectiveTarget, subTarget))
					console.log('```\n')
				})
			}
		}

		console.log(mdParts.other)
	})
})

// --------------------------------------------------------
/**
 * Synchronously reads all files and sub-directories immediately under ${directory} and returns
 * an object containing this information:
 *
 * @param {String} directory the source path to obtain a directory listing
 * @returns {Listing}
 */
function directoryListing(directory) {
	let files = [],
		subDirectories = []

	fs.readdirSync(directory)
	.forEach((fileName) => {
		if (fileName === '.' || fileName === '..')
			return

		let fullPath = path.resolve(directory, fileName),
			stats = fs.statSync(fullPath)

		if (stats.isFile())
			files.push(fileName)
		else if (stats.isDirectory())
			subDirectories.push(fileName)
	})

	files.sort()
	subDirectories.sort()

	return {
		directory,
		files,
		subDirectories
	}
}

/**
 * Synchronously and recursively traverses ${directory} and all sub-directories, calling
 * ${callbackFn} with a Listing for each directory scanned.
 *
 * @param {String} directory the source path to begin traversing
 * @param {listingCallback} callbackFn
 */
function traverseDirectory(directory, callbackFn) {
	let listing = directoryListing(directory)
	callbackFn(listing)
	listing.subDirectories.forEach((subDirectory) => {
		let fullPath = path.resolve(directory, subDirectory)
		traverseDirectory(fullPath, callbackFn)
	})
}

function methodFromName(fileName) {
	let result = fileName.replace(/^\^/, '') 	// Remove any leading ^
		.replace(/\d+\./, '') 				 	// Remove any digits
		.replace(/\.(\w+)$/, '') 				// Remove the extension
		.replace(/\.star$/, '.') 				// Remove any star suffix

	return result.toUpperCase()
}

function splitMd(md) {
	let pos = md.indexOf('#'),
		newLine = md.indexOf('\n', pos + 1)

	return {
		header: md.substr(0, newLine),
		other: md.substr(newLine)
	}
}

function subEndpointFromDirectory(directory) {
	let result = directory.substr(routesDir.length)
	result = result.replace(/\/\^[^\/]+/g, '')
	return result
}
