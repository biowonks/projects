'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const gulp = require('gulp'),
	cleanCSS = require('gulp-clean-css'),
	concat = require('gulp-concat'),
	gls = require('gulp-live-server'),
	gulpif = require('gulp-if'),
	open = require('gulp-open'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify')

const del = require('del'),
	pug = require('pug')

// Local
let config = require('./config'),
	generateRestEndpoints = require('./lib/rest-endpoints')

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

gulp.task('rest-endpoints', function() {
	return generateRestEndpoints(config.routesPath, config.baseUrl, {
		pretty: !config.compress,
		languages: [
			'shell:curl',
			'node',
			'python',
			'ruby'
		]
	})
	.then((restEndpointsHtml) => {
		let outfile = path.resolve(__dirname, 'source', 'includes', 'rest-endpoints.html')
		fs.writeFileSync(outfile, restEndpointsHtml)
	})
})

gulp.task('html', ['clean', 'rest-endpoints'], function(done) {
	let html = pug.renderFile('./source/index.pug', getPageData()),
		outFile = path.resolve(__dirname, 'build', 'index.html')

	fs.writeFile(outFile, html, done)
})

gulp.task('NO_COMPRESS', function() {
	config.compress = false
})

gulp.task('default', ['clean', 'fonts', 'images', 'highlightjs', 'js', 'sass', 'html'])

gulp.task('serve', ['NO_COMPRESS', 'default'], function() {

	gulp.watch(['./source/*.html', './source/includes/**/*'], ['html'])
	gulp.watch('./source/javascripts/**/*', ['js'])
	gulp.watch('./source/stylesheets/**/*', ['sass'])
	gulp.watch('./source/index.yml', ['highlightjs', 'js', 'html'])

	let server = gls.static('build', 4567)
	server.start()

	gulp.watch(['build/**/*'], function(file) {
		server.notify.apply(server, [file])
	})

	gulp.src(__filename).pipe(open({uri: 'http://localhost:4567'}))
})

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
		langs: (config.languageTabs || []).map(function(lang) {
			return typeof lang == 'string' ? lang : lang.keys.first
		}),
		langsJSON: null,
		pretty: !config.compress
	}

	result.langsJSON = JSON.stringify(result.langs)

	return result
}
