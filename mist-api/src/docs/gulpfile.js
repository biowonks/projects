'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const del = require('del'),
	pug = require('pug'),
	gulp = require('gulp'),
	cleanCSS = require('gulp-clean-css'),
	concat = require('gulp-concat'),
	// gls = require('gulp-live-server'),
	gulpif = require('gulp-if'),
	open = require('gulp-open'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify')

// Local
const config = require('./config'),
	MistBootService = require('../node_modules/mist-lib/services/MistBootService'),
	generateRestApiDocs = require('./lib/rest-api-docs'),
	ModelHTMLBuilder = require('./lib/ModelHTMLBuilder')

// Other
let Sequelize = null,
	models = {}, 		// actual database models
	modelExamples = {}	// examples of each database model

try {
	fs.mkdirSync('./build')
}
catch (error) {
	// noop
}

gulp.task('clean', function() {
	return del(['build/*'])
})

gulp.task('fonts', ['clean'], function() {
	return gulp.src('./source/fonts/**/*').pipe(gulp.dest('build/fonts'))
})

gulp.task('images', ['clean'], function() {
	return gulp.src('./source/images/**/*').pipe(gulp.dest('build/images'))
})

gulp.task('js', ['clean'], function() {
	let libs = [
		'./source/javascripts/lib/_energize.js',
		'./source/javascripts/lib/_jquery.js',
		'./source/javascripts/lib/_jquery_ui.js',
		'./source/javascripts/lib/_jquery.tocify.js',
		'./source/javascripts/lib/_imagesloaded.min.js'
	]
	let scripts = [
		'./source/javascripts/app/_lang.js',
		'./source/javascripts/app/_toc.js'
	]

	if (config.search) {
		libs.push('./source/javascripts/lib/_lunr.js')
		libs.push('./source/javascripts/lib/_jquery.highlight.js')
		libs.push('./source/javascripts/app/_search.js')
	}

	return gulp.src(libs.concat(scripts))
		.pipe(concat('all.js'))
		.pipe(gulpif(config.compress, uglify()))
		.pipe(gulp.dest('./build/javascripts'))
})

gulp.task('sass', ['clean'], function() {
	return gulp.src('./source/stylesheets/*.css.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(rename({extname: ''}))
		.pipe(gulpif(config.compress, cleanCSS()))
		.pipe(gulp.dest('./build/stylesheets'))
})

gulp.task('highlightjs', ['clean'], function() {
	let cssPath = './node_modules/highlight.js/styles/' + config.highlightTheme + '.css'
	return gulp.src(cssPath)
		.pipe(rename({prefix: 'highlight-'}))
		.pipe(gulpif(config.compress, cleanCSS()))
		.pipe(gulp.dest('./build/stylesheets'))
})

gulp.task('ready-models', function() {
	let mistBootService = new MistBootService({
		logger: {
			name: 'generator',
			streams: [
				fs.createWriteStream('/dev/null')
			]
		}
	})

	models = mistBootService.setupModels()
	Sequelize = mistBootService.sequelize().Sequelize

	// Build out the examples
	for (let modelName in models) {
		let model = models[modelName],
			example = {},
			fields = model.definition.fields

		// Add default primary key
		if (!model.definition.params.noPrimaryKey)
			example.id = 1

		Object.keys(fields).forEach((fieldName) => {
			let fieldSpec = fields[fieldName]

			// In the event, the primary key is defined on a different column, remove the default
			// primary key field
			if (fieldSpec.primaryKey)
				Reflect.deleteProperty(example, 'id')

			example[fieldName] = fieldSpec.example || null
		})

		if (model.options.timestamps) {
			if (model.options.createdAt !== false)
				example.created_at = '2016-09-20T20:40:36.098Z'
			if (model.options.updatedAt !== false)
				example.updated_at = '2016-09-20T20:55:09.838Z'
		}

		modelExamples[model.name] = example
	}
})

gulp.task('rest-api', ['ready-models'], function() {
	return generateRestApiDocs(config.routesPath, config.baseUrl, {
		pretty: !config.compress,
		languages: config.languages,
		modelExamples
	})
	.then((restApiHtml) => {
		let outfile = path.resolve(__dirname, 'source', 'includes', 'rest-api.html')
		fs.writeFileSync(outfile, restApiHtml)
	})
})

gulp.task('model-structures', ['ready-models'], function() {
	let modelHTMLBuilder = new ModelHTMLBuilder(Sequelize),
		html = '',
		outfile = path.resolve(__dirname, 'source', 'includes', 'model-structures.html')

	for (let modelName in models) {
		let model = models[modelName]
		html += modelHTMLBuilder.html(model, modelExamples[model.name])
	}

	fs.writeFileSync(outfile, html)
})

gulp.task('html', ['clean', 'rest-api', 'model-structures'], function(done) {
	let html = pug.renderFile('./source/index.pug', getPageData()),
		outFile = path.resolve(__dirname, 'build', 'index.html')

	fs.writeFile(outFile, html, done)
})

gulp.task('NO_COMPRESS', function() {
	config.compress = false
})

gulp.task('default', ['clean', 'fonts', 'images', 'highlightjs', 'js', 'sass', 'html'])

// gulp.task('serve', ['NO_COMPRESS', 'default'], function() {

// 	gulp.watch(['./source/*.html', './source/includes/**/*'], ['html'])
// 	gulp.watch('./source/javascripts/**/*', ['js'])
// 	gulp.watch('./source/stylesheets/**/*', ['sass'])
// 	gulp.watch('./source/index.yml', ['highlightjs', 'js', 'html'])

// 	let server = gls.static('build', 4567)
// 	server.start()

// 	gulp.watch(['build/**/*'], function(file) {
// 		server.notify.apply(server, [file])
// 	})

// 	gulp.src(__filename).pipe(open({uri: 'http://localhost:4567'}))
// })

// --------------------------------------------------------
function getPageData() {
	let includes = config.includes
		.map((include) => './source/includes/' + include)
		.map((include) => {
			if (/\.html$/.test(include))
				return fs.readFileSync(include, 'utf8')

			return pug.renderFile(include, {pretty: !config.compress})
		})

	let result = {
		data: config,
		includes,
		languages: config.languages,
		languagesJSON: JSON.stringify((config.languages || []).map((language) => language.name)),
		// langs: (config.languageTabs || []).map(function(lang) {
		// 	return typeof lang == 'string' ? lang : lang.keys.first
		// }),
		// langsJSON: null,
		pretty: !config.compress
	}

	// result.langsJSON = JSON.stringify(result.langs)

	return result
}
