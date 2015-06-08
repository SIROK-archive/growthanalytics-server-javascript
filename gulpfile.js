/* jshint node:true */
/* global -$ */
'use strict';

// Load plugins
var gulp        = require('gulp');
var runSequence = require('run-sequence');
var $           = require('gulp-load-plugins')();

gulp.task('typescript', function () {
    gulp.src('src/main.ts')
        .pipe($.tsc({
            module: 'amd',
            comment: true,
            keepTree: false,
            out: 'growthanalytics.js'
        }))
        .pipe(gulp.dest('target/'))
        .pipe($.notify({message: 'Typescript compile done.'}));
});

gulp.task('uglify', function () {
	var path = 'target/';
    gulp.src(path + 'growthanalytics.js').pipe($.uglifyjs('growthanalytics.min.js')).pipe(gulp.dest(path));
});

gulp.task('default', function() {
	runSequence(
//		'clear',
		'typescript',
		'uglify'
  );
	return gulp.src('').pipe($.notify({message: 'Task is done.'}));
});

