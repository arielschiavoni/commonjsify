'use strict';

var through = require('through');

function commonjsify(content, exports) {
  if (exports) {
    return content + '\n module.exports = window.' + exports + ';';
  } else {
    return content;
  }
}

/**
* Creates the Browserify transform function which Browserify will pass the
* file to.
* @param   {object}    options
* @returns {stream}
*/
module.exports = function(options) {
  /**
  * The function Browserify will use to transform the input.
  * @param   {string} file
  * @returns {stream}
  */
  function browserifyTransform(file) {
    var chunks = [];

    var write = function(buffer) {
      chunks.push(buffer);
    };

    var end = function() {
      var content = Buffer.concat(chunks).toString('utf8');
      // convention fileName == key for shim options
      var fileName = file.match(/([^\/]+)(?=\.\w+$)/)[0];
      this.queue(commonjsify(content, options[fileName]));
      this.queue(null);
    };

    return through(write, end);
  }

  return browserifyTransform;
};

// Test-environment specific exports...
if (process.env.NODE_ENV === 'test') {
  module.exports.commonjsify = commonjsify;
}
