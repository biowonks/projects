/* eslint-disable no-mixed-requires, global-require, no-console */
'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const HTTPSnippet = require('httpsnippet'),
	pug = require('pug'),
	highlight = require('highlight.js'),
	PathRoutifier = require('path-routify/lib/PathRoutifier'),
	cloneDeep = require('lodash.clonedeep'),
	merge = require('lodash.merge')

// Local
const config = require('../config')

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
 * @param {String} routesPath
 * @param {String} baseUrl
 * @param {Object} [options = {}]
 * @param {Boolean} [options.pretty = false]
 * @param {Array.<String>} [options.languages = []]}
 * @returns {Promise}
 */
module.exports = function(routesPath, baseUrl, options = {}) {
	if (!Reflect.has(options, 'pretty'))
		options.pretty = false
	if (!Reflect.has(options, 'languages'))
		options.languages = []

	return new Promise((resolve, reject) => {
		let html = '<h1 id="rest-endpoints">REST Endpoints</h1>\n',
			pathRoutifier = new PathRoutifier(),
			dirRoutes = pathRoutifier.dryRoutify(routesPath),
			observedRootNameSet = new Set(),
			cascadingParameters = new Map()

		// Remove middleware directories or those with no routes
		dirRoutes = dirRoutes.filter((dirRoute) =>
			!dirRoute.directory.startsWith('^') &&
			dirRoute.routes &&
			dirRoute.routes.length
		)

		// Remove middleware routes
		dirRoutes.forEach((dirRoute) => {
			dirRoute.routes = dirRoute.routes.filter((x) => !x.hasMiddlewarePrefix && !x.isStar)
		})

		// Finally, generate the documentation as desired
		dirRoutes.forEach((dirRoute) => {
			let listing = directoryListing(dirRoute.directory),
				relPath = path.relative(routesPath, dirRoute.directory),
				fileNameSet = new Set(listing.files),
				endpoint = dirRoute.routes[0].endpoint,
				url = baseUrl + endpoint,
				rootHeaderName = endpoint.split('/')[1]

			url = url.replace('127.0.0.1', 'localhost')

			// Build out any cascading parameters
			let parts = relPath.split('/')
			parts.map((x, i) => {
				if (i > 0)
					parts[i] = parts[i - 1] + '/' + parts[i]

				return parts[i]
			})
			.forEach((dir, i) => {
				if (cascadingParameters.has(dir))
					return

				let jsFile = `${routesPath}/${dir}/param.docs.js`,
					pathParams = null

				try {
					pathParams = require(jsFile)
				}
				catch (error) {
					if (error.code !== 'MODULE_NOT_FOUND')
						throw error

					// noop
				}

				let parentPathParams = cascadingParameters.get(parts[i-1])
				cascadingParameters.set(dir, merge(parentPathParams, pathParams))
			})

			if (!observedRootNameSet.has(rootHeaderName)) {
				observedRootNameSet.add(rootHeaderName)
				// Check for docs.pug file in base root directory
				let pos = dirRoute.directory.indexOf('/' + rootHeaderName)
				if (pos === -1)
					throw new Error(`did not find ${rootHeaderName} anywhere in route path`)

				let dir = dirRoute.directory.substr(0, pos) + '/' + rootHeaderName,
					rootPugFile = dir + '/docs.pug',
					rootPugString = null

				try {
					rootPugString = fs.readFileSync(rootPugFile)
				}
				catch (error) {
					// noop - probably means the file didn't exist'
				}

				if (rootPugString) {
					html += pug.render(rootPugString)
				}
				else {
					let autoHeaderName = rootHeaderName[0].toUpperCase() + rootHeaderName.substr(1)
					html += `<h2 id="${autoHeaderName.toLowerCase()}">${autoHeaderName}</h2>`
				}
			}

			dirRoute.routes.forEach((route) => {
				let jsFile = path.resolve(dirRoute.directory, route.fileName),
					routeFn = require(jsFile),
					routeDocs = routeFn && routeFn.docs ? cloneDeep(routeFn.docs) : {},
					baseName = path.basename(jsFile, '.js'),
					pugFileName = baseName + '.docs.pug'

				setDefaults(routeDocs, {
					name: `${route.httpMethod} ${endpoint}`,
					id: makeId(routeDocs.name, route.httpMethod, endpoint),
					method: route.httpMethod,
					uri: endpoint,
					har: route.httpMethod === 'get' ? {} : null
				})

				// Replace URI encoded parameters with {}
				routeDocs.parameters = merge(cascadingParameters.get(relPath), routeDocs.parameters)
				let parameterNames = Object.keys(routeDocs.parameters)
				if (parameterNames.length) {
					parameterNames.forEach((name) => {
						let re = new RegExp('\\$' + name + '\\b', 'g')
						routeDocs.uri = routeDocs.uri.replace(re, '{' + name + '}')
					})
				}
				else {
					routeDocs.parameters = null
				}

				if (routeDocs.description)
					routeDocs.description = '<p>' + routeDocs.description.replace(/\n{2,}/g, '</p></p>') + '</p>'

				// Compile the snippets
				if (routeDocs.har)
					routeDocs.snippets = buildSnippets(route.httpMethod, url, options.languages)

				// If pug template exists, preferentially use it
				if (fileNameSet.has(pugFileName)) {
					let pugFile = path.resolve(dirRoute.directory, pugFileName)
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

function setDefaults(dest, defaults) {
	for (let key in defaults) {
		if (!Reflect.has(dest, key) || dest[key] === null)
			dest[key] = defaults[key]
	}
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
