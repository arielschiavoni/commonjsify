/* jshint expr: true */
/* global describe: false, it: false, beforeEach: false */
var should = require('should');
var Commonjsify = require('../index');
var fs = require('fs');

describe('the "commonjsify" function', function() {
  var transformed;
  var options;

  beforeEach(function(done) {
    fs.readFile(__dirname + '/fixtures/exports/lib.js', function(err, content) {
      options = {
        lib: {
          exports: 'lib'
        }
      };
      transformed = Commonjsify.commonjsify(content, options);
      done();
    });
  });

  it('should have returned a string', function() {
    transformed.should.be.a.String;
  });

  it('should export non commonjs module with module.exports', function() {
    transformed.should.containEql('module.exports = ' + options.lib.exports);
  });

});
