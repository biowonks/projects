const fs = require('fs')

const gulp = require('gulp'),
	cleanCSS = require('gulp-clean-css'),
	concat = require('gulp-concat'),
	ejs = require('gulp-ejs'),
	gls = require('gulp-live-server'),
	gulpif = require('gulp-if'),
	open = require('gulp-open'),
	prettify = require('gulp-prettify'),
	rename = require("gulp-rename"),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	gutil = require('gulp-util')

const del = require('del'),
	highlight = require('highlight.js'),
	marked = require('marked'),
	yaml = require('js-yaml')

let renderer = new marked.Renderer()
let COMPRESS = true

renderer.code = function (code, language) {
	let highlighted = language ? highlight.highlight(language, code).value
														 : highlight.highlightAuto(code).value

	return '<pre class="highlight ' + language + '"><code>' + highlighted + '</code></pre>'
}

let readIndexYml = function() {
	return yaml.safeLoad(fs.readFileSync('./source/index.yml', 'utf8'))
}

let getPageData = function() {
	let config = readIndexYml()

	let includes = config.includes
				.map(function(include) { return './source/includes/' + include + '.md' })
				.map(function(include) { return fs.readFileSync(include, 'utf8') })
				.map(function(include) { return marked(include, { renderer: renderer }) })

	return {
		current_page: {
			data: config
		},
		page_classes: '',
		includes: includes,
		image_tag: function(filename, alt, className) {
			return '<img alt="' + alt + '" class="' + className + '" src="images/' + filename + '">'
		},
		javascript_include_tag: function(name) {
			return '<script src="javascripts/' + name + '.js" type="text/javascript"></script>'
		},
		stylesheet_link_tag: function(name, media) {
			return '<link href="stylesheets/' + name + '.css" rel="stylesheet" type="text/css" media="' + media + '" />'
		},
		langs: (config.language_tabs || []).map(function(lang) {
			return typeof lang == 'string' ? lang : lang.keys.first
		})
	}
}

gulp.task('clean', function () {
	return del(['build/*'])
})

gulp.task('fonts', function() {
	return gulp.src('./source/fonts/**/*').pipe(gulp.dest('build/fonts'))
})

gulp.task('images', function() {
	return gulp.src('./source/images/**/*').pipe(gulp.dest('build/images'))
})

gulp.task('js', function() {
	let config = readIndexYml()
	let libs = [
		'./source/javascripts/lib/_energize.js',
		'./source/javascripts/lib/_jquery.js',
		'./source/javascripts/lib/_jquery_ui.js',
		'./source/javascripts/lib/_jquery.tocify.js',
		'./source/javascripts/lib/_imagesloaded.min.js',
	]
	let scripts = [
		'./source/javascripts/app/_lang.js',
		'./source/javascripts/app/_toc.js',
		'./source/javascripts/app/_main.js'
	]

	if (config.search) {
		libs.push('./source/javascripts/lib/_lunr.js')
		libs.push('./source/javascripts/lib/_jquery.highlight.js')
		libs.push('./source/javascripts/app/_search.js')
	}

	return gulp.src(libs.concat(scripts))
		.pipe(concat('all.js'))
		.pipe(gulpif(COMPRESS, uglify()))
		.pipe(gulp.dest('./build/javascripts'))
})

gulp.task('sass', function () {
	return gulp.src('./source/stylesheets/*.css.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(rename({ extname: ''}))
		.pipe(gulpif(COMPRESS, cleanCSS()))
		.pipe(gulp.dest('./build/stylesheets'))
})

gulp.task('highlightjs', function () {
	let config = readIndexYml()
	let path = './node_modules/highlight.js/styles/' + config.highlight_theme + '.css'
	return gulp.src(path)
		.pipe(rename({ prefix: 'highlight-'}))
		.pipe(gulpif(COMPRESS, cleanCSS()))
		.pipe(gulp.dest('./build/stylesheets'))
})

gulp.task('html', function () {
	let data = getPageData()
	return gulp.src('./source/*.html')
		.pipe(ejs(data).on('error', gutil.log))
		.pipe(gulpif(COMPRESS, prettify({indent_size: 2})))
		.pipe(gulp.dest('./build'))
})

gulp.task('NO_COMPRESS', function() {
	COMPRESS = false
})

gulp.task('default', ['clean', 'fonts', 'images', 'highlightjs', 'js', 'sass', 'html'])

gulp.task('serve', ['NO_COMPRESS', 'default'], function() {

	gulp.watch(['./source/*.html', './source/includes/**/*'], ['html'])
	gulp.watch('./source/javascripts/**/*', ['js'])
	gulp.watch('./source/stylesheets/**/*', ['sass'])
	gulp.watch('./source/index.yml', ['highlightjs', 'js', 'html'])

	let server = gls.static('build', 4567)
	server.start()

	gulp.watch(['build/**/*'], function (file) {
		server.notify.apply(server, [file])
	})

	gulp.src(__filename).pipe(open({uri: 'http://localhost:4567'}))
})
