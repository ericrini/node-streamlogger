var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jasmine = require('gulp-jasmine');
var jsdoc = require('gulp-jsdoc');

gulp.task('jshint', function () {
	return gulp.src(['gulpfile.js', 'index.js', './lib/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('jasmine', function () {
	return gulp.src('./lib/**/*-spec.js')
		.pipe(jasmine({
			verbose: true,
			includeStackTrace: true
		}));
});

gulp.task('jsdoc', function () {
	gulp.src(['readme.md', 'index.js', './lib/**/*.js'])
		.pipe(jsdoc('./documentation'));
});