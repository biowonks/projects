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
 * @param {Object.<String,Object>} [options.modelExamples = {}]
 * @returns {Promise}
 */
module.exports = function(routesPath, baseUrl, options = {}) {
	if (!Reflect.has(options, 'pretty'))
		options.pretty = false
	if (!Reflect.has(options, 'languages'))
		options.languages = []
	if (!Reflect.has(options, 'modelExamples'))
		options.modelExamples = {}

	// eslint-disable-next-line no-param-reassign
	baseUrl = baseUrl.replace('127.0.0.1', 'localhost')

	return new Promise((resolve, reject) => {
		let html = '<h1 id="rest-api">REST API</h1>\n',
			dirRoutes = buildRouteList(routesPath),
			observedRootNameSet = new Set(),
			cascadingParameters = new Map()

		// Finally, generate the documentation as desired
		dirRoutes.forEach((dirRoute) => {
			let listing = directoryListing(dirRoute.directory),
				relPath = path.relative(routesPath, dirRoute.directory),
				fileNameSet = new Set(listing.files),
				endpoint = dirRoute.routes[0].endpoint,
				url = baseUrl + endpoint

			updateCascadingParameters(cascadingParameters, relPath, routesPath)
			html += addLeadingSectionHTML(observedRootNameSet, endpoint, dirRoute.directory)

			dirRoute.routes.forEach((route) => {
				let jsFile = path.resolve(dirRoute.directory, route.fileName),
					routeFn = require(jsFile),
					// routeDocs = routeFn && routeFn.docs ? cloneDeep(routeFn.docs) : {},
					routeDocs = routeFn ? routeFn.docs || {} : {},
					baseName = path.basename(jsFile, '.js'),
					pugFileName = baseName + '.docs.pug'

				if (typeof routeDocs === 'function')
					routeDocs = routeDocs(options.modelExamples)
				else
					routeDocs = cloneDeep(routeDocs)

				setDefaults(routeDocs, {
					name: `${route.httpMethod} ${endpoint}`,
					id: makeHTMLId(routeDocs.name, route.httpMethod, endpoint),
					method: route.httpMethod,
					endpoint,
					har: route.httpMethod === 'get' ? {} : null
				})

				routeDocs.parameters = finalizeRouteParameters(cascadingParameters.get(relPath), routeDocs.parameters)
				routeDocs.endpoint = reformatEndpoint(routeDocs.endpoint, routeDocs.parameters)
				routeDocs.description = toHTMLParagraphs(routeDocs.description)
				routeDocs.snippets = buildHTMLSnippets(routeDocs.har, route.httpMethod, url, options.languages)

				normalizeExample(baseUrl, route.httpMethod, routeDocs.endpoint, routeDocs.example)

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

function makeHTMLId(name, method, subEndpoint) {
	let result = name ? name : method + '-' + subEndpoint

	result = result.toLowerCase()
		.replace(/\$/g, '')
		.replace(/(\s+|\/)/g, '-')
		.replace(/-{2,}/g, '-')

	return result
}

/**
 * Uses the path-routify library to detect relevant routes beneath ${routesPath} and further removes
 * those that are middleware routes / paths or are wildcard paths.
 *
 * The result looks like the following:
 * [
 * 	{
 *    directory,
 *    routes: [
 *      {
 *        endpoint: '/',
 *        fileName: 'get.js',
 *        path: '/full/path/to/get.js',
 *        hasMiddlewarePrefix: false,
 *        hasNumericPrefix: false,
 *        httpMethod: 'get',
 *        isStar: false
 *      },
 *      ...
 *    ]
 *  },
 *  ...
 * ]
 *
 * @param {String} routesPath - root directory to scan for routes
 * @returns {Array.<Object>}
 */
function buildRouteList(routesPath) {
	let pathRoutifier = new PathRoutifier(),
		dirRoutes = pathRoutifier.dryRoutify(routesPath)

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

	return dirRoutes
}

/**
 * Iterates through each directory within ${relPath} and if the parameters for this directory have
 * not already been loaded, load and merge with any parent cascading parameters. For example, given
 * the following file structure:
 *
 * /aseqs
 * /aseqs/param.docs.js = {id: {type: 'integer', description: 'aseq_id'}}
 * /aseqs/$id
 * /aseqs/$id/param.docs.js = {id: {type: 'string'}}
 *
 * And ${relPath} = 'aseqs/$id'
 *
 * Updates ${cascadingParameters} to look like:
 *
 * {
 *   aseqs: {
 *     id: {
 *       type: 'integer'
 *     }
 *   },
 *   'aseqs/$id': {
 *     id: {
 *       type: 'string',
 *       description: 'aseq_id'
 *     }
 *   }
 * }
 *
 * @param {Map} cascadingParameters
 * @param {String} relPath
 * @param {String} routesPath
 */
function updateCascadingParameters(cascadingParameters, relPath, routesPath) {
	let pathParts = relPath.split('/')
	pathParts.map((x, i) => {
		if (i > 0)
			pathParts[i] = pathParts[i - 1] + '/' + pathParts[i]

		return pathParts[i]
	})
	.forEach((dir, i) => {
		let alreadyDefined = cascadingParameters.has(dir)
		if (alreadyDefined)
			return

		let paramJsFile = `${routesPath}/${dir}/param.docs.js`,
			pathParams = null

		try {
			pathParams = require(paramJsFile)
		}
		catch (error) {
			let moduleExistsWithError = error.code !== 'MODULE_NOT_FOUND'
			if (moduleExistsWithError)
				throw error

			// noop
		}

		let parentPathParams = cascadingParameters.get(pathParts[i - 1]),
			thisPathParams = merge(parentPathParams, pathParams)
		cascadingParameters.set(dir, thisPathParams)
	})
}

/**
 * Handle creating / loading a root section (${routesPath}/<directory>) HTML lead text. If a pug
 * template is found at docs.pug, then the rendered template is returned; otherwise, the capitalized
 * directory name is returned as a h2 header.
 *
 * All routes directly within ${routesPath} are placed under the 'Root' heading unless a
 * corresponding pug template is present.
 *
 * @param {Set} observedRootNameSet
 * @param {String} endpoint
 * @param {String} directory
 * @returns {String} - HTML header text
 */
function addLeadingSectionHTML(observedRootNameSet, endpoint, directory) {
	let result = '',
		rootHeaderName = endpoint.split('/')[1] || 'Root'

	if (!observedRootNameSet.has(rootHeaderName)) {
		observedRootNameSet.add(rootHeaderName)
		// Check for docs.pug file in base root directory
		let pos = directory.indexOf('/' + rootHeaderName)
		if (pos === -1)
			throw new Error(`did not find ${rootHeaderName} anywhere in route path`)

		let dir = directory.substr(0, pos) + '/' + rootHeaderName,
			rootPugFile = dir + '/docs.pug',
			rootPugString = null

		try {
			rootPugString = fs.readFileSync(rootPugFile)
		}
		catch (error) {
			// noop - probably means the file didn't exist'
		}

		if (rootPugString) {
			result += pug.render(rootPugString)
		}
		else {
			let autoHeaderName = rootHeaderName[0].toUpperCase() + rootHeaderName.substr(1)
			result += `<h2 id="${autoHeaderName.toLowerCase()}">${autoHeaderName}</h2>`
		}
	}

	return result
}

/**
 * Returns a new object that is the result of merging any cascaded parameters with any defined
 * route parameters.
 *
 * @param {Object} cascadedParameters
 * @param {Object} routeParameters
 * @returns {Object}
 */
function finalizeRouteParameters(cascadedParameters, routeParameters) {
	let result = merge(cascadedParameters, routeParameters),
		paramNames = Object.keys(result)

	return paramNames.length ? result : null
}

/**
 * Replaces all occurrences of parameter names in ${uri} with the name surrounded by brackets.
 *
 * For example,
 *
 * /aseqs/$id -> /aseqs/{id}
 *
 * @param {String} uri
 * @param {Object} routeParameters
 * @returns {String}
 */
function reformatEndpoint(uri, routeParameters) {
	if (!routeParameters)
		return uri

	let paramNames = Object.keys(routeParameters),
		result = uri

	paramNames.forEach((name) => {
		let re = new RegExp('\\$' + name + '\\b', 'g')
		result = result.replace(re, '{' + name + '}')
	})

	return result
}

/**
 * @param {String} value
 * @returns {String} - replaces all multiple occurrences of newlines with HTML paragraphs
 */
function toHTMLParagraphs(value) {
	if (!value)
		return null

	return '<p>' + value.replace(/\n{2,}/g, '</p></p>') + '</p>'
}

/**
 * @param {Object} har
 * @param {String} method
 * @param {String} url
 * @param {Array.<Object>} languages
 * @returns {Array.<String>} - array of HTML highlighted code snippets
 */
function buildHTMLSnippets(har, method, url, languages) {
	if (!har)
		return null

	let htmlSnippets = [],
		snippet = new HTTPSnippet({method, url})

	languages.forEach((language) => {
		let unhighlightedCode = snippet.convert(language.snippets.target, language.snippets.client),
			highlightedCodeHtml = highlightCode(language.highlightAs, unhighlightedCode, language.name)

		htmlSnippets.push(highlightedCodeHtml)
	})

	return htmlSnippets.length ? htmlSnippets : null
}

/**
 * @param {String} highlightAs - language to use when highlighting code
 * @param {String} code - textual source code to highlight
 * @param {String} [name = highlightAs] - optional name attribute to use in resulting HTML
 * @returns {String} - code marked up with HTML
 */
function highlightCode(highlightAs, code, name = highlightAs) {
	let highlightedCodeHtml = highlight.highlight(highlightAs, code).value

	return `<pre class="highlight ${name}"><code>${highlightedCodeHtml}</code></pre>`
}

function highlightJSON(object) {
	let json = JSON.stringify(object, null, 2)
	return highlightCode('json', json)
}

/**
 * Iterates through each example in ${examples} and normalizes its data sturcture for consistent
 * usage in the template. Currently only works for GET routes.
 *
 * @param {String} baseUrl
 * @param {String} method
 * @paraM {String} endpoint
 * @param {Array.<Object>} [examples = null]
 */
function normalizeExample(baseUrl, method, endpoint, example) {
	if (method !== 'get' || !example)
		return

	example.request = normalizeRequest(baseUrl, endpoint, example.request)
	example.response = normalizeResponse(example.response)
}

function normalizeRequest(baseUrl, endpoint, request) {
	let result = request || {}

	if (!result.endpoint)
		result.endpoint = endpoint

	if (!result.baseUrl)
		result.baseUrl = baseUrl

	if (!result.parameters) {
		result.parameters = {}
	}
	else {
		// Interpolate all endpoint parameters
		Object.keys(result.parameters).forEach((parameterName) => {
			let value = result.parameters[parameterName],
				regex = new RegExp('{' + parameterName + '}', 'g')
			result.endpoint = result.endpoint.replace(regex, value)
		})
	}

	return result
}

function normalizeResponse(response) {
	let result = response || {}

	if (!result.statusCode)
		result.statusCode = 200
	if (typeof result.body === 'object')
		result.body = highlightJSON(result.body)

	return result
}
