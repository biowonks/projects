/* eslint-disable no-console, global-require , no-mixed-requires*/

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const HTTPSnippet = require('httpsnippet'),
	pug = require('pug'),
	highlight = require('highlight.js')

// Local
const mistApiConfig = require('../../../config'),
	config = require('../config')

// Constants
const pugCompileOptions = {
		pretty: !config.compress
	},
	kRouteTemplateFile = path.resolve(__dirname, '..', 'source', 'templates', 'route.pug')

// Other
let routeTemplateFn = null

try {
	routeTemplateFn = pug.compileFile(kRouteTemplateFile, pugCompileOptions)
}
catch (error) {
	console.error('An error occurred while compiling the route template file: ' + kRouteTemplateFile)
	console.error(error)
	process.exit(1)
}

let [,, routesDir, ...languages] = process.argv
if (!routesDir || !languages.length) {
	console.error('Usage: generate-rest-endpoint-html.js <routes directory> <language> [...]\n')
	process.exit(1)
}

routesDir = path.resolve(routesDir)

let languageMap = {
	shell: 'bash',
	node: 'javascript'
}

console.log('<h1>Rest Endpoints</h1>')

traverseDirectory(routesDir, (listing, depth) => {
	let jsFileNames = listing.files.filter((x) => x.endsWith('.js')),
		pugFileNames = listing.files.filter((x) => x.endsWith('.docs.pug')),
		pugFileNameSet = new Set(pugFileNames),
		subEndpoint = subEndpointFromDirectory(listing.directory),
		url = mistApiConfig.server.baseUrl + subEndpoint,
		isRoot = depth === 1

	url = url.replace('127.0.0.1', 'localhost')

	if (isRoot) {
		if (pugFileNameSet.has('docs.pug')) {
			let fullFile = path.resolve(listing.directory, 'docs.pug'),
				html = pug.renderFile(fullFile)
			console.log(html)
		}
		else {
			let dirBaseName = path.basename(listing.directory),
				autoHeaderName = dirBaseName[0].toUpperCase() + dirBaseName.substr(1)
			console.log(`<h2>${autoHeaderName}</h2>`)
		}
	}

	jsFileNames.forEach((jsFileName) => {
		let method = methodFromName(jsFileName),
			jsFile = path.resolve(listing.directory, jsFileName),
			routeFn = require(jsFile),
			routeDocs = routeFn && routeFn.docs ? routeFn.docs : {},
			baseName = path.basename(jsFile, '.js'),
			pugFileName = baseName + '.docs.pug'

		setDefaults(routeDocs, {
			name: `${method} ${subEndpoint}`,
			method,
			uri: subEndpoint,
			har: method === 'GET' ? {} : null
		})

		console.error(`Processing ${listing.directory}/${jsFileName}`)

		// Compile the snippets
		if (routeDocs.har)
			routeDocs.snippets = buildSnippets(method, url, languages)

		// If pug template exists, preferentially use it
		let html = ''
		if (pugFileNameSet.has(pugFileName)) {
			let pugFile = path.resolve(listing.directory, pugFileName)
			html = pug.renderFile(pugFile, routeDocs)
		}
		else {
			// No template, use built-in route template
			html = routeTemplateFn(routeDocs)
		}

		console.log(html)
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
 * @param {Number} [depth = 0]
 */
function traverseDirectory(directory, callbackFn, depth = 0) {
	let listing = directoryListing(directory)
	callbackFn(listing, depth)
	listing.subDirectories.forEach((subDirectory) => {
		let fullPath = path.resolve(directory, subDirectory)
		traverseDirectory(fullPath, callbackFn, depth + 1)
	})
}

function methodFromName(fileName) {
	let result = fileName.replace(/^\^/, '') 	// Remove any leading ^
		.replace(/\d+\./, '') 				 	// Remove any digits
		.replace(/\.(\w+)$/, '') 				// Remove the extension
		.replace(/\.star$/, '.') 				// Remove any star suffix

	return result.toUpperCase()
}

function setDefaults(dest, defaults) {
	for (let key in defaults) {
		if (!Reflect.has(dest, key) || dest[key] === null)
			dest[key] = defaults[key]
	}
}

function subEndpointFromDirectory(directory) {
	let result = directory.substr(routesDir.length)
	result = result.replace(/\/\^[^\/]+/g, '')
	return result
}

function buildSnippets(method, url, langs) {
	let snippets = []

	let snippet = new HTTPSnippet({method, url})

	langs.forEach((lang) => {
		let effectiveLang = lang,
			subLang = null
		if (lang.includes(':')) {
			let parts = lang.split(':')
			effectiveLang = parts[0]
			subLang = parts[1]
		}

		let unhighlightedCode = snippet.convert(effectiveLang, subLang),
			highlightLang = languageMap[effectiveLang] || effectiveLang,
			highlightedCodeHtml = highlight.highlight(highlightLang, unhighlightedCode).value

		highlightedCodeHtml = `<pre class="highlight ${highlightLang}"><code>${highlightedCodeHtml}</code></pre>`

		snippets.push(highlightedCodeHtml)
	})

	return snippets.length ? snippets : null
}
