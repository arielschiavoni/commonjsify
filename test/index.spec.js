/* jshint expr: true */
/* global describe: false, it: false, beforeEach: false */
'use strict';

var should = require('should');
var Commonjsify = require('../index');

describe('when the module is required', function() {
  it('should return a function', function() {
    Commonjsify.should.be.a.Function;
  });
});

describe('when the module is instantiated', function() {
  var transform;

  beforeEach(function() {
    transform = new Commonjsify();
  });

  it('should return a function named "browserifyTransform"', function() {
    transform.name.should.be.exactly('browserifyTransform');
  });

  describe('when the browserifyTransform function is called with a ' +
           'valid file path', function() {

    var stream;

    beforeEach(function() {
      stream = transform(__dirname + '/fixtures/file.txt');
    });

    it('should return a Stream object', function() {
      should(stream.writable).ok;
      should(stream.readable).ok;
      stream.write.should.be.a.Function;
      stream.end.should.be.a.Function;
    });
  });

});
