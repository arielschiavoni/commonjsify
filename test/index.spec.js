/* global describe: false, it: false, beforeEach: false */
'use strict';

var expect = require('chai').expect;
var Commonjsify = require('../index');

describe('module integration', function() {

  describe('commonjsify is required', function() {
    it('should return a function', function() {
      expect(Commonjsify).to.be.a('function');
    });
  });

  describe('commonjsify is instantiated', function() {
    var transform;

    beforeEach(function() {
      transform = new Commonjsify();
    });

    it('should return a function named "browserifyTransform"', function() {
      expect(transform.name).to.eql('browserifyTransform');
    });

    describe('browserifyTransform function is called with a ' +
             'valid file path', function() {
      var stream;

      beforeEach(function() {
        stream = transform(__dirname + '/fixtures/file.txt');
      });

      it('should return a Stream object', function() {
        expect(stream.writable).to.be.ok();
        expect(stream.readable).to.be.ok();
        expect(stream.write).to.be.a('function');
        expect(stream.end).to.be.a('function');
      });
    });
  });
});
