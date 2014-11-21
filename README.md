# commonjsify
[![Stories in Ready](https://badge.waffle.io/arielschiavoni/commonjsify.png?label=ready&title=Ready)](https://waffle.io/arielschiavoni/commonjsify)
[![David Status](https://david-dm.org/arielschiavoni/commonjsify.png)](https://david-dm.org/arielschiavoni/commonjsify)
[![Build Status](https://api.shippable.com/projects/5464dd8cc6f0803064f45ffb/badge?branchName=master)](https://app.shippable.com/projects/5464dd8cc6f0803064f45ffb/builds/latest)

[![NPM](https://nodei.co/npm/commonjsify.png?downloads=true&stars=true)](https://nodei.co/npm/commonjsify/)

[Browserify](https://github.com/substack/node-browserify) transform for non CommonJS libraries/scripts.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Install](#install)
- [Options](#options)
- [Usage](#usage)
    - [Basic example](#basic-example)
    - [Advanced and more practical example](#advanced-and-more-practical-example)
- [Contributing](#contributing)
    - [Style-Guide](#style-guide)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

With [npm](http://npmjs.org) do:
```shell
$ npm install commonjsify --save-dev
```

## Options

commonjsify accepts a configuration object and returns the transform
function to be applied with browserify.

``` js
var commonjsify = require('commonjsify');
var options = {};
var transform = commonjsify(options);
```

`options` is an object that you have to fill with some information about the
non CommonJS modules that you want to convert to CommonJS.
The format for this object is:
* **key** - must be the same as the filename that you are requiring
            with `browserify.require(filename, opts)` without extension (it is a convention)
* **value** - defines how you want to export the module (depends on the library
that you are trying to transform to CommonJS)

**Example**: If you want to transform [angular](https://angularjs.org/) to CommonJS
you can configure it like this:

``` js
var browserify = require('browserify');
var commonjsify = require('commonjsify');
// key: angular --> because we require ./vendor/angular.js
// value: angular --> because angular is the global variable that the library creates
// and we must export
var options = {
  angular: 'angular'
};

browserify()
.require(require.resolve('./vendor/angular.js'), {entry: true, expose: 'angular'})
.transform(commonjsify(options))
.bundle()
.pipe(fs.createWriteStream(__dirname + '/bundle.js'))
```

## Usage

#### Basic example

```javascript
'use strict';

var browserify = require('browserify');
var fs = require('fs');

browserify()
.require(require.resolve('./vendor/lib.js'), {entry: true, expose: 'myLib'})
.transform(commonjsify({
  'lib': 'lib'
}))
.bundle()
.pipe(fs.createWriteStream(__dirname + '/bundle.js'))
```

Then in your page you can do:

``` html
<script src="bundle.js"></script>
<script>
  var myLib = require('myLib');
  /* ... */
</script>
```

#### Advanced and more practical example

The following example shows how you can use `commonjsify` to transform `angular`
and [angular-ui-router](https://github.com/angular-ui/ui-router)
which are non CommonJS modules. This scenario is particularly useful when you
want to get rid of `bower` dependencies and just use `npm` (see [Front-end Tooling Workflows by Addy Osmani](https://speakerdeck.com/addyosmani/front-end-tooling-workflows?slide=161))
as the only source of true for your packages.

The code below shows a gulp task to create multiple bundles, one for vendor
and another for the application itself.

```javascript
'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var commonjsify = require('commonjsify');
var stringify = require('stringify');
var source = require('vinyl-source-stream');
var production = (process.env.NODE_ENV === 'production');

gulp.task('bundle', ['bundle-vendor', 'bundle-app']);

gulp.task('bundle-vendor', 'Bundle JavaScript vendor', function() {
  browserify({
    noParse: true,
    debug: !production
  })
  .require(require.resolve('angular'), {entry: true, expose: 'angular'})
  .require(require.resolve('angular-ui-router'), {expose: 'ui.router'})
  .transform(commonjsify({
    'angular': 'angular',
    'angular-ui-router': 'angular.module(\'ui.router\')'
  }))
  .bundle()
  .pipe(source('vendor.js'))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('bundle-app', 'Bundle JavaScript modules', function() {
  browserify({
    entries: './src/app.js',
    debug: !production
  })
  .transform(stringify({
    extensions: ['.html'],
    minify: true
  }))
  .external('angular')
  .external('ui.router')
  .bundle()
  .pipe(source('app.js'))
  .pipe(gulp.dest('./dist/'));
});
```

Then in your page you can do:

``` html
<script src="vendor.js"></script>
<script src="app.js"></script>
<script>
  var angular = require('angular');
  var uiRouter = require('ui.router');
  console.log(uiRouter.name);

  var appVersion = angular.injector(['app']).get('version');
  console.log(appVersion);
  /* ... */
</script>
```

## Contributing

If you would like to contribute code, please do the following:

1. Fork this repository and make your changes.
2. Write tests for any new functionality. If you are fixing a bug that tests did not cover, please make a test that reproduces the bug.
3. Add your name to the "contributors" section in the `package.json` file.
4. Squash all of your commits into a single commit via `git rebase -i`.
5. Run the tests by running `npm install && npm test` from the source directory.
6. Assuming those pass, send the Pull Request off to me for review!

Please do not iterate the package.json version number – I will do that myself when I publish it to NPM.

#### Style-Guide

Please follow [google](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml) style-guide for all code contributions.

## License

MIT
