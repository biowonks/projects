/* eslint-disable no-mixed-requires, global-require, no-console */
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
let routeTemplateFn = null,
	languageMap = {
		shell: 'bash',
		node: 'javascript'
	}

try {
	routeTemplateFn = pug.compileFile(kRouteTemplateFile, pugCompileOptions)
}
catch (error) {
	console.error('[rest-endpoints.js] FATAL: Unable to compile the route template file: ' + kRouteTemplateFile)
	throw error
}

/**
 * @param {String} routesDir
 * @param {Object} [options = {}]
 * @param {Boolean} [options.pretty = false]
 * @param {Array.<String>] [options.languages = []]}
 * @returns {Promise}
 */
module.exports = function(routesDir, options = {}) {
	if (!Reflect.has(options, 'pretty'))
		options.pretty = false
	if (!Reflect.has(options, 'languages'))
		options.languages = []

	return new Promise((resolve, reject) => {
		let html = '<h1 id="rest-endpoints">REST Endpoints</h1>\n'

		traverseDirectory(routesDir, (listing, depth) => {
			let jsFileNames = listing.files.filter((x) => x.endsWith('.js')),
				pugFileNames = listing.files.filter((x) => x.endsWith('.docs.pug')),
				pugFileNameSet = new Set(pugFileNames),
				subEndpoint = subEndpointFromDirectory(listing.directory, routesDir),
				url = mistApiConfig.server.baseUrl + subEndpoint

			url = url.replace('127.0.0.1', 'localhost')

			if (depth === 0 || depth === 1) {
				if (pugFileNameSet.has('docs.pug')) {
					let fullFile = path.resolve(listing.directory, 'docs.pug')
					html += pug.renderFile(fullFile)
				}
				else if (depth === 1) {
					let dirBaseName = path.basename(listing.directory),
						autoHeaderName = dirBaseName[0].toUpperCase() + dirBaseName.substr(1)
					html += `<h2 id="${autoHeaderName.toLowerCase()}">${autoHeaderName}</h2>`
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
					id: makeId(routeDocs.name, method, subEndpoint),
					method,
					uri: subEndpoint,
					har: method === 'GET' ? {} : null
				})

				// Replace URI encoded parameters with {}
				if (routeDocs.parameters) {
					routeDocs.parameters.forEach((parameter) => {
						let re = new RegExp('\\$' + parameter.name + '\\b', 'g')
						routeDocs.uri = routeDocs.uri.replace(re, '{' + parameter.name + '}')
					})
				}

				if (routeDocs.description)
					routeDocs.description = '<p>' + routeDocs.description.replace(/\n{2,}/g, '</p></p>') + '</p>'

				// Compile the snippets
				if (routeDocs.har)
					routeDocs.snippets = buildSnippets(method, url, options.languages)

				// If pug template exists, preferentially use it
				if (pugFileNameSet.has(pugFileName)) {
					let pugFile = path.resolve(listing.directory, pugFileName)
					html += pug.renderFile(pugFile, routeDocs)
				}
				else {
					// No template, use built-in route template
					html += routeTemplateFn(routeDocs)
				}
			})
		})

		resolve(html)
	})
}

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

function subEndpointFromDirectory(directory, routesDir) {
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

function makeId(name, method, subEndpoint) {
	let result = name ? name : method + '-' + subEndpoint

	result = result.toLowerCase()
		.replace(/\$/g, '')
		.replace(/(\s+|\/)/g, '-')
		.replace(/-{2,}/g, '-')

	return result
}
