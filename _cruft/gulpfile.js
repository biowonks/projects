'use strict'

// Core includes
let path = require('path'),
	spawn = require('child_process').spawn

// 3rd party includes
let gulp = require('gulp'),
	gulpIstanbul = require('gulp-istanbul'),
	gulpMocha = require('gulp-mocha'),
	gulpShell = require('gulp-shell'),
	gutil = require('gulp-util')

// Local includes
let pipelineConfig = require('./config').pipeline

// Special variables :)
let serverInstance = null

// --------------------------------------------------------
// Configuration
let kWatchPatterns = [
	'./*.js',
	'lib/**/*.js',
	'models/**/*.js',
	'routes/**/*.js',
	'services/**/*.js'
]

// --------------------------------------------------------
// gulp.task('default', gulp.series(['server', 'watch'])

let kTestFiles = [
	'pipeline/**/*.tests.js',
	'services/**/*.tests.js',
	'models/**/*.tests.js',
	'lib/*.tests.js'
]

let kRunTimeFiles = [
	'pipeline/**/*.js',
	'**/!*.tests.js'
]

gulp.task('test', test)
gulp.task('instrument', instrument)
gulp.task('coverage', gulp.series(instrument, coverage))

function test(done) {
	return gulp.src(kTestFiles)
		.pipe(gulpMocha({
			timeout: 30000,
			log: false,
			require: [
				'./testing/test-setup.js'
			]
		}))
		.on('end', () => (done ? done() : null))
}

function instrument() {
	return gulp.src(kRunTimeFiles)
		// Covering files
		.pipe(gulpIstanbul({
			includeUntested: true
		}))
		// Force `require` to return covered files
		.pipe(gulpIstanbul.hookRequire())
}

function coverage(done) {
	return test()
		.pipe(gulpIstanbul.writeReports({
			dir: './testing/coverage',
			reporters: [
				'lcov',
				'html'
			]
		}))
}


gulp.task('clean-vendor', function(done) {
	let cleanScript = path.resolve(pipelineConfig.paths.vendor, 'clean.sh')
	// eslint-disable-next-line no-undefined
	shellCommandHelper(cleanScript, null, undefined, done)
})

gulp.task('install-coils', function(done) {
	let installScript = path.resolve(pipelineConfig.paths.vendor, 'install-coils.sh')

	gutil.log('Installing coils')
	// eslint-disable-next-line no-undefined
	shellCommandHelper(installScript, null, undefined, done)
})

gulp.task('install-hmmer3', function(done) {
	let installScript = path.resolve(pipelineConfig.paths.vendor, 'install-hmmer3.sh'),
		hmmer3Config = pipelineConfig.vendor.hmmer3

	gutil.log(`Installing HMMER3 version ${hmmer3Config.version}`)
	// eslint-disable-next-line no-undefined
	shellCommandHelper(installScript, [hmmer3Config.version, hmmer3Config.basePath], undefined, done)
})

gulp.task('install-seg', function(done) {
	let installScript = path.resolve(pipelineConfig.paths.vendor, 'install-seg.sh')

	gutil.log('Installing seg')
	// eslint-disable-next-line no-undefined
	shellCommandHelper(installScript, null, undefined, done)
})

gulp.task('install-pfam', gulp.series('install-hmmer3', installPfamHelper))
function installPfamHelper(done) {
	let installScript = path.resolve(pipelineConfig.paths.vendor, 'install-pfam.sh'),
		pfamConfig = pipelineConfig.vendor.pfam,
		env = Object.create(process.env)

	env.PATH = env.PATH + ':' + pipelineConfig.vendor.hmmer3.binPath

	gutil.log(`Installing Pfam ${pfamConfig.version}`)
	shellCommandHelper(installScript, [pfamConfig.version, pfamConfig.basePath], {env}, done)
}

gulp.task('eslint', gulpShell.task(path.resolve(__dirname, 'scripts', 'eslint.sh')))

/*
gulp.task('watch', function() {
	gulp.watch(kWatchPatterns, ['server'])
})

gulp.task('server', function() {
	if (serverInstance)
		serverInstance.kill()

	serverInstance = spawn('node', ['index.js'], {stdio: 'inherit'})
	serverInstance.on('close', function(code) {
		if (code === 1)
			gutil.log('Error detected, waiting for changes...')
		else if (code === 2)
			process.exit(2)
	})
})
*/

// --------------------------------------------------------
// Private helper methods
function shellCommandHelper(command, args, options, done) {
	let child = spawn(command, args || [], options)

	function toConsole(data) {
		gutil.log(data.toString())
	}

	child.stdout.on('data', toConsole)
	child.stderr.on('data', toConsole)
	child.on('close', (code) => {
		let error = code ? new Error(`Command failed: ${command}`) : null
		done(error)
	})
}

// --------------------------------------------------------
process.on('exit', function() {
	if (serverInstance)
		serverInstance.kill()
})

