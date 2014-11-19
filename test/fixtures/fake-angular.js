(function(window, document, undefined) {

  'use strict';
  var angular = window.angular || (window.angular = {});
  angular.VERSION = '1.3.3';
  angular.modules = {};

  angular.module = function(name, obj) {
    if (obj) {
      angular.modules[name] = obj;
    } else if (!!!angular.modules[name]) {
      angular.modules[name] = {name: name};
    }
    return angular.modules[name];
  };

})(window, document);
