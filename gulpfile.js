'use strict';

var gulp = require('gulp');
require('gulp-help')(gulp);

var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var openInBrowser = require('gulp-open');

var yargs = require('yargs').argv;
var browser = !!yargs.browser;
var coverage = !!yargs.coverage;

var scripts = [
  './*.js',
  './src/*.js',
  './test/*.js'
];

gulp.task('lint', 'Lint all Javascript files' ,function() {
  return gulp.src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', 'Run tests' ,function() {
  return gulp.src('./src/*.js')
    .pipe(gulpif(coverage, istanbul()))
    .on('finish', function() {
      return gulp.src('./test/*.spec.js', { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .pipe(gulpif(coverage, istanbul.writeReports({
          dir: './coverage',
          reporters: [ 'lcov', 'json', 'cobertura' ]
        })))
        .on('finish', function () {
          return gulp.src('./coverage/lcov-report/index.html')
            .pipe(gulpif(
              coverage && browser,
              openInBrowser('file://' + __dirname + '/coverage/lcov-report/index.html')
            ));
        });
    });
});
