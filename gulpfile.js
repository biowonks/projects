'use strict'

// Core includes
let path = require('path'),
	spawn = require('child_process').spawn

// 3rd party includes
let gulp = require('gulp'),
	gulpIstanbul = require('gulp-istanbul'),
	gulpMocha = require('gulp-mocha'),
	gutil = require('gulp-util'),
	eslint = require('gulp-eslint')

// Local includes
let pipelineConfig = require('./pipeline/config')

// Special variables :)
let serverInstance

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
	'pipeline/scripts/**/*.tests.js'
]

let kRunTimeFiles = [
	'pipeline/scripts/lib/**/*.js',
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
				'./pipeline/scripts/test-setup.js'
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
		.pipe(gulpIstanbul.hookRequire());
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
		// .on('end', endProcess.bind(null, done)); // call `done` & then exit
}


gulp.task('install-hmmer3', function(done) {
	let installScript = path.resolve(__dirname, 'pipeline', 'scripts', 'install-hmmer3.sh'),
		hmmer3Config = pipelineConfig.vendor.hmmer3
	
	gutil.log(`Installing HMMER3 version ${hmmer3Config.version}`)
	shellCommandHelper(installScript, [hmmer3Config.version, hmmer3Config.basePath], undefined, done)
})

gulp.task('install-pfam', gulp.series('install-hmmer3', installPfamHelper))
function installPfamHelper(done) {
	let installScript = path.resolve(__dirname, 'pipeline', 'scripts', 'install-pfam.sh'),
		pfamConfig = pipelineConfig.vendor.pfam,
		env = Object.create(process.env)
	
	env.PATH = `${env.PATH}:${pipelineConfig.vendor.hmmer3.binPath}`
	
	gutil.log(`Installing Pfam ${pfamConfig.version}`)
	shellCommandHelper(installScript, [pfamConfig.version, pfamConfig.basePath], {
		env: env
	}, done)
}

/*
gulp.task('lint', function() {
	return gulp.src(kWatchPatterns)
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failOnError last.
        .pipe(eslint.failOnError())
})

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
	let child = spawn(command, args, options)
	
	function toConsole(data) {
		gutil.log(data.toString())
	}
	
	child.stdout.on('data', toConsole)
	child.stderr.on('data', toConsole)
	child.on('close', (code) => {
		if (code)
			return done(new Error(`Command failed: ${command}`))
		
		done()
	})
}

// --------------------------------------------------------
process.on('exit', function() {
	if (serverInstance)
		serverInstance.kill()
})

