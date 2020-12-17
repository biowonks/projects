'use strict'

// Core
const fs = require('fs');
const path = require('path');

// Vendor
const del = require('del');
const pug = require('pug');
const { series, src, dest, parallel } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

// Local
const config = require('./config');
const MistBootService = require('../node_modules/mist-lib/services/MistBootService');
const generateRestApiDocs = require('./lib/rest-api-docs');
const ModelHTMLBuilder = require('./lib/ModelHTMLBuilder');

// Other
let Sequelize = null;
let models; 		// actual database models
const modelExamples = {};	// examples of each database model

try {
	fs.mkdirSync('./build');

	// Cheater way to get the favicon symlink to work as expected for the API
	fs.symlinkSync('images/favicon.ico', './build/favicon.ico');
}
catch (error) {
	// noop
}

const clean = exports.clean = () => del(['build/*']);

const fonts = () => src('./source/fonts/*').pipe(dest('./build/fonts'));

const images = () => src('./source/images/**/*').pipe(dest('build/images'));

const js = () => {
	const libs = [
		'./source/javascripts/lib/_energize.js',
		'./source/javascripts/lib/_jquery.js',
		'./source/javascripts/lib/_jquery_ui.js',
		'./source/javascripts/lib/_jquery.tocify.js',
		'./source/javascripts/lib/_imagesloaded.min.js',
	]
	const scripts = [
		'./source/javascripts/app/_lang.js',
		'./source/javascripts/app/_toc.js',
	];

	if (config.search) {
		libs.push('./source/javascripts/lib/_lunr.js');
		libs.push('./source/javascripts/lib/_jquery.highlight.js');
		libs.push('./source/javascripts/app/_search.js');
	}

	return src(libs.concat(scripts))
		.pipe(concat('all.js'))
		.pipe(gulpif(config.compress, uglify()))
		.pipe(dest('./build/javascripts'));
};

exports.sass = () => {
	return src('./source/stylesheets/*.css.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(rename({extname: ''}))
		.pipe(gulpif(config.compress, cleanCSS()))
		.pipe(dest('./build/stylesheets'));
};

const highlightjs = () => {
	const cssPath = './node_modules/highlight.js/styles/' + config.highlightTheme + '.css';
	return src(cssPath)
		.pipe(rename({prefix: 'highlight-'}))
		.pipe(gulpif(config.compress, cleanCSS()))
		.pipe(dest('./build/stylesheets'));
};

const readyModels = (done) => {
	const mistBootService = new MistBootService({
		logger: {
			name: 'generator',
			streams: [
				fs.createWriteStream('/dev/null')
			]
		}
	});

	models = mistBootService.setupModels();
	Sequelize = mistBootService.sequelize().Sequelize;

	// Build out the examples
	for (let modelName in models) {
		const model = models[modelName];
		const example = {};
		const fields = model.definition.fields;

		// Add default primary key
		if (!model.definition.params.noPrimaryKey) {
			example.id = 1;
		}

		Object.keys(fields).forEach((fieldName) => {
			const fieldSpec = fields[fieldName];

			// In the event, the primary key is defined on a different column, remove the default
			// primary key field
			if (fieldSpec.primaryKey) {
				Reflect.deleteProperty(example, 'id')
			}

			example[fieldName] = fieldSpec.example || null;
		});

		if (model.options.timestamps) {
			if (model.options.createdAt !== false) {
				example.created_at = '2020-09-20T20:40:36.098Z'
			}
			if (model.options.updatedAt !== false) {
				example.updated_at = '2020-09-20T20:55:09.838Z'
			}
		}

		modelExamples[model.name] = example;
	}
	done();
};

const restAPI = () => {
	return generateRestApiDocs(config.routesPath, config.baseUrl, {
		pretty: !config.compress,
		languages: config.languages,
		modelExamples
	})
	.then((restApiHtml) => {
		let outfile = path.resolve(__dirname, 'source', 'includes', 'rest-api.html')
		fs.writeFileSync(outfile, restApiHtml)
	});
};

const modelStructures = (done) => {
	const modelHTMLBuilder = new ModelHTMLBuilder(Sequelize);
	let html = '';
	const outfile = path.resolve(__dirname, 'source', 'includes', 'model-structures.html');

	for (let modelName in models) {
		const model = models[modelName];
		html += modelHTMLBuilder.html(model, modelExamples[model.name]);
	};

	fs.writeFile(outfile, html, done);
};

const html = (done) => {
	const html = pug.renderFile('./source/index.pug', getPageData());
	const outFile = path.resolve(__dirname, 'build', 'index.html');

	fs.writeFile(outFile, html, done);
};

exports.build = series(
	clean,
	parallel(
		fonts,
		images,
		highlightjs,
		js,
		exports.sass,
		series(
			readyModels,
			parallel(
				restAPI,
				modelStructures,
			),
			html,
		),
	),
);

// --------------------------------------------------------
function getPageData() {
	const includes = config.includes
		.map((include) => './source/includes/' + include)
		.map((include) => {
			if (/\.html$/.test(include)) {
				return fs.readFileSync(include, 'utf8');
			}

			return pug.renderFile(include, {pretty: !config.compress});
		});

	const result = {
		data: config,
		includes,
		languages: config.languages,
		languagesJSON: JSON.stringify((config.languages || []).map((language) => language.name)),
		pretty: !config.compress,
	};

	return result;
}
