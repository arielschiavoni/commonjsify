'use strict';

var gulp = require('gulp');
require('gulp-help')(gulp);

var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var openInBrowser = require('gulp-open');

var yargs = require('yargs').argv;
var browser = !!yargs.browser;
var coverage = !!yargs.coverage;

// required to write test reports in CI, mocha does not support
// multiple reports or write reports to a file so I use reporter-file npm
// package to solve this problem
if (process.env.CI) {
  process.env.MOCHA_REPORTER_FILE = './test/result.xml';
}

var scripts = [
  './*.js',
  './src/*.js',
  './test/*.js'
];

gulp.task('jscs', 'Check JavaScript coding guidelines', function() {
  return gulp.src(scripts)
    .pipe(jscs());
});

gulp.task('jshint', 'Check JavaScript syntax errors', function() {
  return gulp.src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint', 'Lint all Javascript files', ['jshint', 'jscs']);

gulp.task('test', 'Run tests' , function() {
  return gulp.src('./src/*.js')
    .pipe(gulpif(coverage, istanbul()))
    .on('finish', function() {
      return gulp.src('./test/*.spec.js', {read: false})
        .pipe(mocha({
          reporter: process.env.CI ? 'reporter-file' : 'spec'
        }))
        .pipe(gulpif(coverage, istanbul.writeReports({
          dir: './coverage',
          reporters: ['lcov']
        })))
        .on('finish', function() {
          return gulp.src('./coverage/lcov-report/index.html')
            .pipe(gulpif(
              coverage && browser,
              openInBrowser('file://' + __dirname +
                '/coverage/lcov-report/index.html')
            ));
        });
    });
});
