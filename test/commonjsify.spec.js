/* global describe: false, it: false, beforeEach: false */
'use strict';

var expect = require('chai').expect;
var commonjsify = require('..');
var fs = require('fs');
var browserify = require('browserify');
var vm = require('vm');

describe('commonjsify', function() {

  describe('isolated transform function', function() {
    var transform = function(exportAs, cb) {
      var file = __dirname + '/fixtures/lib.js';
      fs.readFile(file, function(err, content) {
        if (err) {
          cb(err);
        } else {
          // convert Buffer to string
          content = content.toString();
          cb(null, commonjsify.commonjsify(content, exportAs));
        }
      });
    };

    it('should return a string', function(done) {
      transform('lib', function(err, transformed) {
        if (err) {
          done(err);
        } else {
          expect(transformed).to.be.a('string');
          done();
        }
      });
    });

    it('should export a non CommonJS library ' +
       'using "module.exports"', function(done) {

      var exportAs = 'libTest';
      transform(exportAs, function(err, transformed) {
        if (err) {
          done(err);
        } else {
          expect(transformed).to.contain('module.exports = window.' + exportAs);
          done();
        }
      });
    });

    it('should not append "module.exports" when exports ' +
       'is undefined', function(done) {

      var exportAs;
      transform(exportAs, function(err, transformed) {
        if (err) {
          done(err);
        } else {
          expect(transformed).not.to.contain('module.exports = window.');
          done();
        }
      });
    });
  });

  describe('integrated transform with browserify', function() {
    var fixtures = __dirname + '/fixtures';
    var bundle = function(requires, commonjsifyConfig, cb) {
      var bundler = browserify({noParse: false});
      requires.forEach(function(r, i) {
        var requireOpts = {expose: r.expose};
        if (i === 0) {
          // mark the first require as entry. It is mandatory otherwise
          // browserify's transform is ignored
          requireOpts.entry = true;
        }
        bundler.require(r.file, requireOpts);
      });
      // convention require name has to be equal to shim key
      bundler.transform(commonjsify(commonjsifyConfig));
      bundler.bundle(function(err, src) {
        var sandbox = {
          window: {},
          document: {}
        };
        if (err) {
          cb(err);
        } else {
          // when source bundle script runs into sandbox
          // context it is gonna expose the browser "require" global function
          vm.runInNewContext(src, sandbox);
          // console.log(src.toString());
          cb(sandbox);
        }
      })
      .pipe(fs.createWriteStream(__dirname + '/bundle.js'));
    };

    it('should transform non CJS libs' +
       ' to CJS and allow to require them', function(done) {

      var requires = [{
        file: fixtures + '/lib.js',
        expose: 'lib'
      }, {
        file: fixtures + '/xLib.js',
        expose: 'xLib'
      }];

      var commonjsifyConfig = {
        lib: 'lib',
        xLib: 'xLib'
      };

      bundle(requires, commonjsifyConfig, function(sandbox) {
        var lib = sandbox.require('lib');
        expect(lib.VERSION).to.be.eql('1.0.0');
        expect(lib).to.have.property('echo');
        expect(lib.echo('test')).to.be.eql('test');

        var xLib = sandbox.require('xLib');
        expect(xLib).to.have.property('echo');
        expect(xLib.echo('123')).to.be.eql('hey! 123');
        done();
      });
    });

    it('should allow to customize the library name to export', function(done) {

      var requires = [{
        file: fixtures + '/fake-angular.js',
        expose: 'angular'
      }, {
        file: fixtures + '/fake-angular-ui-router.js',
        expose: 'ui.router'
      }];

      // convention: require object file name === commonjsifyConfig.key
      var commonjsifyConfig = {
        'fake-angular': 'angular',
        'fake-angular-ui-router': 'angular.module(\'ui.router\')'
      };

      bundle(requires, commonjsifyConfig, function(sandbox) {
        var angular = sandbox.require('angular');
        expect(angular.module).to.be.ok();
        expect(angular.VERSION).to.be.eql('1.3.3');
        expect(angular.modules).to.be.an('object');
        expect(angular.modules).to.be.empty();
        expect(angular.module('ui.router')).not.to.have.property('route');

        var uiRouter = sandbox.require('ui.router');
        expect(uiRouter).to.be.ok();
        expect(uiRouter).to.have.property('route');
        expect(angular.module('ui.router')).to.have.property('route');
        done();
      });

    });

    describe('when library is required with browserify but it is not ' +
             'specified in transform options', function() {

      it('should export an empty object', function(done) {

        var requires = [{
          file: fixtures + '/lib.js',
          expose: 'lib'
        }, {
          file: fixtures + '/xLib.js',
          expose: 'xLib'
        }];

        var commonjsifyConfig = {
          lib: 'lib'
        };

        bundle(requires, commonjsifyConfig, function(sandbox) {
          var lib = sandbox.require('lib');
          expect(lib.VERSION).to.be.eql('1.0.0');

          var xLib = sandbox.require('xLib');
          expect(xLib).to.be.ok();
          expect(xLib).to.be.eql({});
          done();
        });

      });

    });

    describe.skip('transform option key', function() {
      it('should match bundler.require file name without extension');
    });

    describe.skip('transform option value', function() {
      it('should be the value that you want to export for the non CJS ' +
         'module, which should also match with the "expose" value in ' +
         'browserify.require');
    });

  });
});
