'use strict';

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	eslint = require('gulp-eslint'),
	spawn = require('child_process').spawn;

var serverInstance;

// --------------------------------------------------------
// Configuration
var config = {
	watchPatterns: [
		'./*.js',
		'lib/**/*.js',
		'models/**/*.js',
		'routes/**/*.js',
		'services/**/*.js'
	]
};

// --------------------------------------------------------
gulp.task('default', ['server', 'watch']);

gulp.task('lint', function() {
	return gulp.src(config.watchPatterns)
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failOnError last.
        .pipe(eslint.failOnError());
});

gulp.task('watch', function() {
	gulp.watch(config.watchPatterns, ['server']);
});

gulp.task('server', function() {
	if (serverInstance)
		serverInstance.kill();

	serverInstance = spawn('node', ['index.js'], {stdio: 'inherit'});
	serverInstance.on('close', function(code) {
		if (code === 1)
			gutil.log('Error detected, waiting for changes...');
		else if (code === 2)
			process.exit(2);
	});
});

// --------------------------------------------------------
process.on('exit', function() {
	if (serverInstance)
		serverInstance.kill();
});
