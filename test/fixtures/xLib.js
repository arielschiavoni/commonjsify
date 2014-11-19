(function(window) {
  'use strict';

  var lib = require('lib');
  var xLib = {};

  xLib.VERSION = '0.0.1';

  xLib.echo = function(value) {
    return 'hey! ' + lib.echo(value);
  };

  window.xLib = xLib;

})(window);
